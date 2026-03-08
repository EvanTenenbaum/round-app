export default function Custom500() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48}}>⭕</div>
        <h1 style={{fontSize:24,fontWeight:700,margin:'16px 0 8px'}}>Something went wrong</h1>
        <a href="/" style={{color:'#E8733A'}}>Go home</a>
      </div>
    </div>
  )
}
