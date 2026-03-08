export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:64}}>⭕</div>
        <h1 style={{fontSize:24,fontWeight:700,color:'#1A1614',marginTop:12}}>Page not found</h1>
        <p style={{color:'#9E9088',marginTop:8}}>This page doesn't exist.</p>
        <a href="/" style={{display:'inline-block',marginTop:20,background:'#E8733A',color:'#fff',padding:'10px 24px',borderRadius:12,fontWeight:600,textDecoration:'none'}}>Go home</a>
      </div>
    </div>
  )
}
