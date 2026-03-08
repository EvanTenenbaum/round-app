// Round — Seed data for development

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Round database...')

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      clerkId: 'user_demo_alice',
      email: 'alice@example.com',
      name: 'Alice Chen',
      bio: 'Home cook obsessed with Asian fusion.',
      neighborhoodName: 'Mission District',
      city: 'San Francisco',
      state: 'CA',
      lat: 37.7614, lng: -122.4200,
      dietaryRestrictions: ['GLUTEN_FREE'],
      cookingStyles: ['Asian', 'Fusion', 'Healthy'],
      cookingSkillLevel: 4,
      containerPolicy: 'I provide containers — keep them, no return needed',
      reliabilityScore: 1.0,
      onboardingComplete: true,
      subscriptionTier: 'MEMBER',
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      clerkId: 'user_demo_bob',
      email: 'bob@example.com',
      name: 'Bob Martinez',
      bio: 'Dad of two. My specialty is Mexican comfort food.',
      neighborhoodName: 'Mission District',
      city: 'San Francisco', state: 'CA',
      lat: 37.7620, lng: -122.4210,
      dietaryRestrictions: ['GLUTEN_FREE'],
      cookingStyles: ['Mexican', 'Comfort', 'BBQ'],
      cookingSkillLevel: 3,
      containerPolicy: 'I provide containers — keep them',
      reliabilityScore: 0.92,
      onboardingComplete: true,
    },
  })

  const carol = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      clerkId: 'user_demo_carol',
      email: 'carol@example.com',
      name: 'Carol Osei',
      bio: 'Vegetarian cook. Love experimenting with West African recipes.',
      neighborhoodName: 'Mission District',
      city: 'San Francisco', state: 'CA',
      lat: 37.7600, lng: -122.4190,
      dietaryRestrictions: ['VEGETARIAN'],
      cookingStyles: ['African', 'Mediterranean', 'Vegan'],
      cookingSkillLevel: 5,
      reliabilityScore: 1.0,
      onboardingComplete: true,
    },
  })

  const dan = await prisma.user.upsert({
    where: { email: 'dan@example.com' },
    update: {},
    create: {
      clerkId: 'user_demo_dan',
      email: 'dan@example.com',
      name: 'Dan Nakamura',
      bio: 'Software engineer who cooks to decompress. Japanese and Italian.',
      neighborhoodName: 'Mission District',
      city: 'San Francisco', state: 'CA',
      lat: 37.7625, lng: -122.4205,
      cookingStyles: ['Japanese', 'Italian', 'Pasta'],
      cookingSkillLevel: 3,
      reliabilityScore: 0.88,
      onboardingComplete: true,
    },
  })

  // Create the circle
  const circle = await prisma.circle.upsert({
    where: { inviteCode: 'MISSION4' },
    update: {},
    create: {
      name: 'Mission Kitchen Circle',
      description: 'Four neighbors sharing weeknight dinners. Everyone cooks once, everyone eats all week.',
      inviteCode: 'MISSION4',
      maxSize: 5,
      status: 'ACTIVE',
      neighborhoodName: 'Mission District',
      city: 'San Francisco', state: 'CA',
      lat: 37.7612, lng: -122.4200,
      isPublic: true,
      createdById: alice.id,
    },
  })

  // Memberships with turns assigned
  await prisma.circleMembership.upsert({
    where: { circleId_userId: { circleId: circle.id, userId: alice.id } },
    update: {},
    create: {
      circleId: circle.id, userId: alice.id,
      role: 'OWNER', status: 'ACTIVE', turn: 'MON',
      reliabilityRate: 1.0, totalMealsCooked: 12, totalMealsReceived: 36,
    },
  })
  await prisma.circleMembership.upsert({
    where: { circleId_userId: { circleId: circle.id, userId: bob.id } },
    update: {},
    create: {
      circleId: circle.id, userId: bob.id,
      role: 'MEMBER', status: 'ACTIVE', turn: 'TUE',
      reliabilityRate: 0.92, noShowCount: 1, totalMealsCooked: 11, totalMealsReceived: 33,
    },
  })
  await prisma.circleMembership.upsert({
    where: { circleId_userId: { circleId: circle.id, userId: carol.id } },
    update: {},
    create: {
      circleId: circle.id, userId: carol.id,
      role: 'MEMBER', status: 'ACTIVE', turn: 'WED',
      reliabilityRate: 1.0, totalMealsCooked: 10, totalMealsReceived: 30,
    },
  })
  await prisma.circleMembership.upsert({
    where: { circleId_userId: { circleId: circle.id, userId: dan.id } },
    update: {},
    create: {
      circleId: circle.id, userId: dan.id,
      role: 'MEMBER', status: 'ACTIVE', turn: 'THU',
      reliabilityRate: 0.88, noShowCount: 1, totalMealsCooked: 9, totalMealsReceived: 27,
    },
  })

  // Meals this week
  const monday    = getNextWeekday(1)
  const tuesday   = getNextWeekday(2)
  const wednesday = getNextWeekday(3)
  const thursday  = getNextWeekday(4)

  await prisma.meal.create({
    data: {
      circleId: circle.id, cookId: alice.id,
      title: 'Miso Glazed Salmon with Rice',
      description: 'Wild caught salmon marinated in white miso, sake, and ginger. Served with jasmine rice and bok choy.',
      cuisineType: 'Japanese',
      dietaryTags: ['GLUTEN_FREE'],
      allergenNotes: 'Contains: fish, soy. Free of: gluten, nuts, dairy.',
      servingsAvailable: 4, servingsSaved: 3,
      containerPolicy: 'I provide containers — keep them, no return needed',
      pickupTime: new Date(monday.setHours(18, 30, 0, 0)),
      pickupLocation: 'Front porch, 123 Valencia St',
      status: 'POSTED',
      cookDate: monday,
    },
  })

  await prisma.meal.create({
    data: {
      circleId: circle.id, cookId: bob.id,
      title: "Bob's Green Chile Enchiladas",
      description: 'Chicken enchiladas smothered in homemade tomatillo sauce.',
      cuisineType: 'Mexican',
      allergenNotes: 'Contains: gluten, dairy, chicken. Free of: nuts.',
      servingsAvailable: 4, servingsSaved: 1,
      containerPolicy: 'I provide containers — keep them',
      pickupTime: new Date(tuesday.setHours(17, 45, 0, 0)),
      pickupLocation: 'Side door, 145 Guerrero St',
      status: 'POSTED',
      cookDate: tuesday,
    },
  })

  await prisma.meal.create({
    data: {
      circleId: circle.id, cookId: carol.id,
      title: 'Jollof Rice with Fried Plantains',
      description: 'Nigerian-style jollof made with long-grain rice, tomatoes, and peppers. Rich and smoky.',
      cuisineType: 'West African',
      dietaryTags: ['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE'],
      allergenNotes: 'Free of: gluten, meat, dairy, nuts. Contains: tomatoes, peppers.',
      servingsAvailable: 5, servingsSaved: 0,
      pickupTime: new Date(wednesday.setHours(19, 0, 0, 0)),
      pickupLocation: 'Apartment 2B, 200 18th St — buzz #2',
      status: 'POSTED',
      cookDate: wednesday,
    },
  })

  await prisma.meal.create({
    data: {
      circleId: circle.id, cookId: dan.id,
      title: 'Tonkotsu Ramen',
      description: 'Rich pork bone broth simmered for 12 hours. Soft boiled egg, chashu pork, nori.',
      cuisineType: 'Japanese',
      allergenNotes: 'Contains: pork, soy, egg. May contain: gluten (noodles).',
      servingsAvailable: 3, servingsSaved: 0,
      pickupTime: new Date(thursday.setHours(18, 0, 0, 0)),
      pickupLocation: 'Front door, 88 Dolores St',
      status: 'DRAFT',
      cookDate: thursday,
    },
  })

  console.log('✅ Seeded:')
  console.log('   👥 4 users: alice, bob, carol, dan')
  console.log(`   ⭕ 1 circle: "${circle.name}" (invite: ${circle.inviteCode})`)
  console.log('   🍽️  4 meals this week')
  console.log('   Login: alice@example.com is a Round Member')
}

function getNextWeekday(targetDay: number): Date {
  const today = new Date()
  const daysUntil = (targetDay - today.getDay() + 7) % 7 || 7
  const result = new Date(today)
  result.setDate(today.getDate() + daysUntil)
  return result
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1) })
