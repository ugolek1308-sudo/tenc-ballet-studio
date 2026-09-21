const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'Обновите страницу и повторите отправку.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'Неверный формат запроса.'},415);
 try{
  const raw=await request.text();if(raw.length>3000)return reply({error:'Слишком длинная заявка.'},413);
  const data=JSON.parse(raw);
  const clean=(v:unknown)=>typeof v==='string'?v.replace(/[\r\n<>]/g,' ').trim():'';
  const name=clean(data.name),phone=clean(data.phone),comment=clean(data.comment),age=clean(data.age);
  if(data.website)return reply({error:'Не удалось отправить заявку.'},400);
  if(!name||name.length>60||!['7','8','9'].includes(age)||data.consent!==true||comment.length>250||!/^\+?[\d\s()-]{10,22}$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15)return reply({error:'Проверьте имя, телефон, возраст ребёнка и согласие.'},400);
  // Existing studio service accepts name, phone and consent only. Include
  // enquiry details in its name field so no submitted information is lost.
  const summary=`${name} — ребёнок ${age} лет; балет и современная хореография${comment?`; Вопрос: ${comment}`:''}`;
  const response=await fetch('https://xn--m1ajn0a.xn--p1ai/send',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:summary,phone,consent:true}),signal:AbortSignal.timeout(15000)});
  if(response.status!==200)return reply({error:'Студия пока не смогла принять заявку. Попробуйте позднее или позвоните: +7 977 555-33-44.'},502);
  return reply({ok:true});
 }catch{return reply({error:'Не удалось подтвердить отправку. Позвоните нам: +7 977 555-33-44.'},502);}
}
