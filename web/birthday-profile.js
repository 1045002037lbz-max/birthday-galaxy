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
    title:`${name}，${birthdayAge}岁的生日快乐`,
    dedication:`写给产科护士 ${name} · 属于你的第 ${birthdayAge} 岁`,
    paragraphs:[
      `你熟悉产房里那些需要被认真听见的细节，也知道在紧张的时刻，专业、判断和一句清晰的解释有多重要。你把稳妥放进每一次照护里，把安心留给正在经历重要时刻的人。`,
      `人们常记得新生命到来的第一声啼哭；我也想把掌声留给那之前漫长而细致的守候：一次观察、一次核对、一遍耐心说明，以及那些不在镜头里的及时伸手。它们未必被说出口，却实实在在地托住了一个家庭。`,
      `愿你继续拥有把事情做稳的专业，也拥有把自己照顾好的余裕。交班之后，愿疲惫有人分担；夜班之后，愿睡眠完整；忙碌的间隙，愿热饭和温水都来得及。你不必时时坚强，也不必把所有人的需要都排在自己前面。`,
      `愿你在陪伴新生命开启旅程时，也常常遇见自己的新鲜与欢喜。愿认真被看见，付出有回响；愿生活不只向你索取温柔，也把温柔一份份还给你。`,
    ],
    closing:`${name}，愿你守护新生，也一直被生活好好守护。`
  };
}
