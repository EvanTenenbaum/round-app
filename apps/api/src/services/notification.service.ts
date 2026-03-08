import { PrismaClient } from '@prisma/client'

type NotificationType = 'TURN_REMINDER' | 'TURN_CONFIRM_REQUEST' | 'SEAT_SAVED' | 'CIRCLE_INVITE' | 'CIRCLE_MEMBER_JOINED' | 'MEAL_POSTED' | 'PICKUP_REMINDER' | 'SYSTEM'
import Expo from 'expo-server-sdk'

const expo = new Expo()

interface SendNotificationParams {
  type: NotificationType
  title: string
  body: string
  excludeUserId?: string
  data?: Record<string, string>
}

export class NotificationService {
  constructor(private db: PrismaClient) {}

  async sendToUser(userId: string, params: Omit<SendNotificationParams, 'excludeUserId'>) {
    const notif = await this.db.notification.create({
      data: {
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data || {},
      },
    })

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    })
    if (user?.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
      await this.sendPush([user.expoPushToken], params)
    }

    return notif
  }

  async notifyCircleMembers(circleId: string, params: SendNotificationParams) {
    const members = await this.db.circleMembership.findMany({
      where: { circleId, status: 'ACTIVE' },
      include: { user: { select: { id: true, expoPushToken: true } } },
    })

    const tokens: string[] = []
    for (const m of members) {
      if (m.userId === params.excludeUserId) continue

      await this.db.notification.create({
        data: {
          userId: m.userId,
          type: params.type,
          title: params.title,
          body: params.body,
          data: params.data || {},
        },
      })

      if (m.user.expoPushToken && Expo.isExpoPushToken(m.user.expoPushToken)) {
        tokens.push(m.user.expoPushToken)
      }
    }

    if (tokens.length) await this.sendPush(tokens, params)
  }

  private async sendPush(tokens: string[], params: Pick<SendNotificationParams, 'title' | 'body' | 'data'>) {
    const messages = tokens.map(to => ({
      to,
      title: params.title,
      body: params.body,
      data: params.data,
      sound: 'default' as const,
    }))

    const chunks = expo.chunkPushNotifications(messages)
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk)
      } catch (err) {
        console.error('Push notification error:', err)
      }
    }
  }
}
