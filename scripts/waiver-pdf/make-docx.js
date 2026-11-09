const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,ImageRun,AlignmentType,Table,TableRow,TableCell,WidthType,BorderStyle,ShadingType,TabStopType,PageBreak,Footer,PageNumber,LevelFormat}=require('docx');
const RED='E30613',FONT='Arial';
let html=fs.readFileSync('body.html','utf8').replace('<h3>Declarație unică pe proprie răspundere</h3>','').replace(/<a [^>]*>([^<]*)<\/a>/g,'$1');
const dec=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
// runs from inline html: <b>, <span class="g|k">
function runs(h,size=20){const out=[];const re=/(<b>|<\/b>|<span class="g">|<span class="k">|<\/span>)/g;let bold=false,color=null,last=0,m;
 const push=t=>{t=dec(t);if(t)out.push(new TextRun({text:t,bold:bold||!!color,color:color||undefined,font:FONT,size}))};
 while((m=re.exec(h))){push(h.slice(last,m.index));const tg=m[1];if(tg==='<b>')bold=true;else if(tg==='</b>')bold=false;else if(tg==='<span class="g">')color='0A8F3C';else if(tg==='<span class="k">')color=RED;else color=null;last=re.lastIndex}push(h.slice(last));return out}
const body=[];
for(const m of html.matchAll(/<p>([\s\S]*?)<\/p>|<li>([\s\S]*?)<\/li>/g)){
 if(m[1]!==undefined)body.push(new Paragraph({children:runs(m[1].trim()),alignment:AlignmentType.JUSTIFIED,spacing:{after:110,line:276}}));
 else body.push(new Paragraph({children:runs(m[2].trim()),numbering:{reference:'dash',level:0},alignment:AlignmentType.JUSTIFIED,spacing:{after:40,line:276}}));
}
const logo=fs.readFileSync('logo-black.png');
const header=(title,sub)=>[
 new Table({width:{size:9638,type:WidthType.DXA},columnWidths:[3200,6438],borders:{top:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},insideHorizontal:{style:BorderStyle.NONE},insideVertical:{style:BorderStyle.NONE},bottom:{style:BorderStyle.SINGLE,size:18,color:RED}},
  rows:[new TableRow({children:[
   new TableCell({width:{size:3200,type:WidthType.DXA},borders:{top:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},bottom:{style:BorderStyle.SINGLE,size:18,color:RED}},margins:{bottom:100},children:[new Paragraph({children:[new ImageRun({type:'png',data:logo,transformation:{width:140,height:57}})]})]}),
   new TableCell({width:{size:6438,type:WidthType.DXA},verticalAlign:'center',borders:{top:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},bottom:{style:BorderStyle.SINGLE,size:18,color:RED}},margins:{bottom:100},children:[
    new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:title.toUpperCase(),bold:true,font:FONT,size:28})]}),
    new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:sub,font:FONT,size:16,color:'555555'})]})]})]})]}),
 new Paragraph({spacing:{after:120},children:[]})];
// form helpers
const W=9638;
const line=(label,tab=W)=>new TextRun({text:'',font:FONT});
const field=(parts)=>{ // parts: [[label, endPos]]
 const ch=[];const stops=[];
 parts.forEach(([lab,end],i)=>{ if(i>0)ch.push(new TextRun({text:'\t',font:FONT}));
  ch.push(new TextRun({text:lab+' ',bold:true,font:FONT,size:18}));ch.push(new TextRun({text:'\t',font:FONT,underline:{}}));stops.push({type:TabStopType.LEFT,position:end}); });
 // underline tabs: use tab with underline via leader? use leader underscore
 return new Paragraph({spacing:{before:400,after:80},tabStops:stops.map((s,i)=>({...s,leader:i%1===0?'underscore':undefined})),children:ch});};
const boxTitle=t=>new Paragraph({spacing:{before:240,after:120},border:{top:{style:BorderStyle.SINGLE,size:18,color:RED,space:6}},children:[new TextRun({text:t.toUpperCase(),bold:true,font:FONT,size:20})]});
const chk=(t,tag)=>new Paragraph({spacing:{after:110},indent:{left:400,hanging:400},alignment:AlignmentType.JUSTIFIED,children:[new TextRun({text:'☐\t',font:'Segoe UI Symbol',size:22}),new TextRun({text:t+' ',font:FONT,size:18}),...(tag?[new TextRun({text:tag,bold:true,font:FONT,size:18})]:[])],tabStops:[{type:TabStopType.LEFT,position:400}]});
const cb={style:BorderStyle.SINGLE,size:6,color:'333333'};const cbs={top:cb,bottom:cb,left:cb,right:cb};
const cell=(t,w,head)=>new TableCell({width:{size:w,type:WidthType.DXA},borders:cbs,shading:head?{type:ShadingType.CLEAR,fill:'F1F1F1',color:'auto'}:undefined,margins:{left:100,right:100,top:60,bottom:60},children:[new Paragraph({children:[new TextRun({text:t,bold:!!head,font:FONT,size:18})]})]});
const kids=new Table({width:{size:W,type:WidthType.DXA},columnWidths:[700,7338,1600],rows:[new TableRow({children:[cell('Nr.',700,1),cell('Nume și prenume copil',7338,1),cell('Vârsta',1600,1)]}),...[1,2,3,4,5,6].map(n=>new TableRow({height:{value:600,rule:'atLeast'},children:[cell(n+'.',700),cell('',7338),cell('',1600)]}))]});
const page2=[new Paragraph({children:[new PageBreak()]}),...header('Date participanți','Se completează de părinte / tutore sau de participantul adult'),
 boxTitle('Părinte / tutore sau participant adult'),
 field([['Nume și prenume:',W]]),
 new Paragraph({spacing:{before:400,after:80},tabStops:[{type:TabStopType.LEFT,position:4500,leader:'underscore'},{type:TabStopType.LEFT,position:4900},{type:TabStopType.LEFT,position:W,leader:'underscore'}],children:[new TextRun({text:'Telefon: ',bold:true,font:FONT,size:18}),new TextRun({text:'\t\t',font:FONT}),new TextRun({text:'Email: ',bold:true,font:FONT,size:18}),new TextRun({text:'\t',font:FONT})]}),
 field([['Contact de urgență (nume și telefon):',W]]),
 new Paragraph({spacing:{before:400,after:80},children:[new TextRun({text:'Semnez pentru:   ',bold:true,font:FONT,size:18}),new TextRun({text:'☐ doar pentru mine (adult)     ☐ pentru copilul / copiii mei     ☐ pentru mine și copilul / copiii mei',font:FONT,size:18})]}),
 boxTitle('Copii (minori) pentru care semnez'),kids,
 boxTitle('Acorduri și semnătură'),
 chk('Am citit, am înțeles și sunt de acord cu declarația de mai sus, în nume propriu și pentru minorii menționați.','(obligatoriu)'),
 chk('Sunt de acord ca ACS Ninja Sport să păstreze aceste date pentru evidența accesului în sală.','(obligatoriu)'),
 chk('Sunt de acord să apar (eu și/sau minorul) în fotografii și clipuri folosite pe saitul și rețelele sociale Ninja Sport. Pot retrage acordul oricând, pe email. (opțional)'),
 new Paragraph({spacing:{before:600,after:60},tabStops:[{type:TabStopType.LEFT,position:3400,leader:'underscore'},{type:TabStopType.LEFT,position:4000},{type:TabStopType.LEFT,position:W,leader:'underscore'}],children:[new TextRun({text:'Data: ',bold:true,font:FONT,size:18}),new TextRun({text:'\t\t',font:FONT}),new TextRun({text:'Semnătura: ',bold:true,font:FONT,size:18}),new TextRun({text:'\t',font:FONT})]}),
 new Paragraph({spacing:{before:500},alignment:AlignmentType.CENTER,children:[new TextRun({text:'Declarația este valabilă pentru toate vizitele ulterioare. O poți completa și online, de pe telefon: ',font:FONT,size:16,color:'444444'}),new TextRun({text:'ninjasport.ro/waiver',bold:true,font:FONT,size:16,color:'444444'})]})];
// fix: Semnez line field() pattern for single-label rows needs tab stops with leader
const doc=new Document({
 numbering:{config:[{reference:'dash',levels:[{level:0,format:LevelFormat.BULLET,text:'–',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:260}},run:{color:RED,bold:true}}}]}]},
 styles:{default:{document:{run:{font:FONT,size:19}}}},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:720,bottom:900,left:1134,right:1134,footer:400}}},
  footers:{default:new Footer({children:[new Paragraph({tabStops:[{type:TabStopType.RIGHT,position:W}],border:{top:{style:BorderStyle.SINGLE,size:4,color:'CCCCCC',space:4}},children:[new TextRun({text:'ACS Ninja Sport · Splaiul Unirii 160, București · 0721.012.130 · ninjasport.ro',font:FONT,size:14,color:'777777'}),new TextRun({size:14,children:['\tPagina ',PageNumber.CURRENT,' / ',PageNumber.TOTAL_PAGES],font:FONT,size:14,color:'777777'})]})]})},
  children:[...header('Declarație pe proprie răspundere','Waiver · Sală de sporturi cu obstacole · Splaiul Unirii 160, București'),...body,...page2]}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync('Declaratie.docx',b));
