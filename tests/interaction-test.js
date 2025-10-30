const puppeteer = require('puppeteer');
const fs = require('fs');
(async ()=>{
  const out = [];
  const serverPort = process.env.PORT || 8005;
  const base = `http://localhost:${serverPort}`;
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  try{
    // Test 1: sistema.html admin login
    await page.goto(base + '/sistema.html', {waitUntil:'networkidle2'});
    out.push('opened sistema.html');
    await page.waitForSelector('#adminUser', {timeout:2000});
    await page.type('#adminUser','admin');
    await page.type('#adminPass','admin');
    // prepare to capture any alert
    page.on('dialog', async dialog => { out.push('dialog: '+dialog.message()); await dialog.accept(); });
    await page.click('#btnAdminLogin');
    // wait a bit for DOM update
    await page.waitForTimeout(500);
    const adminVisible = await page.evaluate(()=>{
      const a = document.getElementById('adminArea');
      if(!a) return 'absent';
      return a.classList.contains('hidden') ? 'hidden' : 'visible';
    });
    out.push('adminArea='+adminVisible);

    // Test 2: cadastro submission
    await page.goto(base + '/cadastro.html', {waitUntil:'networkidle2'});
    out.push('opened cadastro.html');
    // fill fields
    await page.select('#interesse','voluntariado').catch(()=>{});
    await page.type('#nome','Fulano de Tal');
    await page.type('#email','fulano@example.com');
    await page.type('#cpf','52998224725'); // commonly used test-CNPJ
    await page.type('#telefone','11987654321');
    await page.evaluate(()=>{ document.getElementById('nascimento').value='1990-01-01'; });
    await page.type('#endereco','Rua Teste, 123');
    await page.type('#numero','123');
    await page.type('#cep','12345678');
    await page.select('#cidade','São Paulo').catch(()=>{});
    await page.select('#uf','SP').catch(()=>{});

    // handle alert from submit
    let sawDialog = false;
    page.on('dialog', async dialog => { sawDialog = true; out.push('dialog on cadastro: '+dialog.message()); await dialog.accept(); });

    await page.click('#btnSubmit');
    await page.waitForTimeout(700);
    const stored = await page.evaluate(()=>localStorage.getItem('cadastro_jpt'));
    out.push('cadastro_localStorage_present='+(stored? 'yes':'no'));
    if(stored){ out.push('cadastro_sample='+stored.slice(0,200)); }

    await browser.close();
    fs.writeFileSync('/tmp/puppeteer-results.txt', out.join('\n'));
    console.log('SUCCESS');
    console.log(out.join('\n'));
  }catch(err){
    try{ await browser.close(); }catch(_){ }
    fs.writeFileSync('/tmp/puppeteer-results-error.txt', String(err)+"\n\n"+JSON.stringify(out,null,2));
    console.error('ERROR', err);
    process.exit(2);
  }
})();