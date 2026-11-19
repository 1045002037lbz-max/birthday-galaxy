// The entry is a local birthday ritual. No network request or credential storage.
let recipient = null;
export function shanghaiToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);
  const value=type=>Number(parts.find(part=>part.type===type).value);
  return {year:value('year'),month:value('month'),day:value('day')};
}
export function createBirthdayProfile(nameValue, birthdayValue, today = shanghaiToday()) {
  const name=String(nameValue??'').replace(/[\u0000-\u001f\u007f]/g,'').trim();
  if(!name)throw new Error('先告诉我，今天想被祝福的名字吧。');
  if(Array.from(name).length>20)throw new Error('名字请写在 20 个字以内。');
  const match=/^(\d{4})\.(\d{2})\.(\d{2})$/.exec(String(birthdayValue??'').trim());
  if(!match)throw new Error('生日口令请按 2000.02.01 这样的格式填写。');
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  const leap=year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if(year<1900||month<1||month>12||day<1||day>days[month-1])throw new Error('这个生日好像不存在，再检查一下年月日吧。');
  if(year>today.year||year===today.year&&(month>today.month||month===today.month&&day>today.day))throw new Error('出生日期还在未来，请再检查一下。');
  const before=today.month<month||today.month===month&&today.day<day;
  const passed=today.month>month||today.month===month&&today.day>day;
  const celebrationYear=today.year+(passed?1:0);
  const birthdayAge=celebrationYear-year,currentAge=today.year-year-(before?1:0);
  return Object.freeze({name,birthdayAge,currentAge,celebrationYear,birthdayLabel:`${match[2]}.${match[3]}`});
}
export function setRecipient(profile){recipient=profile;}
export function getRecipient(){return recipient;}
export function cakeGreeting(profile){return Array.from(profile.name).length>12?profile.name:`${profile.name}，${profile.birthdayAge}岁快乐`;}
export function birthdayBlessing(profile){
  const {name,birthdayAge}=profile;
  return {
    title:`${name}，${birthdayAge}岁生日快乐`,
    dedication:`写给 ${name} · 属于你的第 ${birthdayAge} 岁`,
    paragraphs:[
      `潘姝含，生日快乐！在玄武湖街道仙居雅苑党群服务中心的日常里，你用耐心倾听居民的心声，用真诚回应每一份期待。那些看似平凡的小事，因为你的认真而有了温度。`,
      `社区是千家万户共同生活的地方。愿你继续带着热情与善意，在基层服务的岗位上，把关怀送到居民身边，让邻里更亲近，让社区更温暖。`,
      `愿每一次走访都有收获，每一次协调都有回响，每一份热心与付出都被理解和珍惜。愿你守护万家灯火的同时，也有人记挂你的辛劳、分享你的喜悦。`,
      `新的一岁，愿你工作顺利、心有所获，既有认真做好每一件事的坚定，也有享受生活、奔赴热爱的自由。愿你在服务他人的同时，也永远被生活温柔以待。`
    ],
    closing:`潘姝含，愿你心有暖阳，岁岁欢喜，生日快乐。`
  };
}
