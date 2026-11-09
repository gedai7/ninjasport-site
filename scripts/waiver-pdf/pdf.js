const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+__dirname+'/waiver.html');await p.waitForTimeout(300);
await p.pdf({path:'Declaratie_Ninja_Sport.pdf',format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',
footerTemplate:'<div style="width:100%;font-family:sans-serif;font-size:8px;color:#777;padding:0 20mm;display:flex;justify-content:space-between"><span>ACS Ninja Sport · Splaiul Unirii 160, București · 0721.012.130 · ninjasport.ro</span><span>Pagina <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
margin:{top:'12mm',bottom:'14mm',left:'20mm',right:'20mm'}});await b.close()})()
