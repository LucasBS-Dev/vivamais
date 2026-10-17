import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const senha=process.env.E2E_PASSWORD;if(!senha)throw new Error('Defina E2E_PASSWORD no ambiente seguro.');
const destino=new URL('../docs/evidencias/visual/',import.meta.url);await mkdir(destino,{recursive:true});
const navegador=await chromium.launch();
try{
 const contexto=await navegador.newContext({viewport:{width:1280,height:720}}),pagina=await contexto.newPage();
 await pagina.goto('http://127.0.0.1:3000');await pagina.getByRole('heading',{name:'Acesso do Profissional',exact:true}).waitFor();await pagina.screenshot({caret:'initial',path:new URL('web-login.png',destino).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await pagina.getByLabel('E-mail institucional').fill('profissional.a@demo.vivamais.invalid');await pagina.getByLabel('Senha',{exact:true}).fill(senha);await pagina.getByRole('button',{name:'Entrar na plataforma',exact:true}).click();await pagina.waitForURL('**/painel',{timeout:60000});await pagina.getByRole('link',{name:'Cadastrar paciente',exact:true}).waitFor();await pagina.screenshot({caret:'initial',path:new URL('web-painel.png',destino).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await pagina.goto('http://127.0.0.1:3000/pacientes/novo');await pagina.getByRole('heading',{name:'Cadastrar novo paciente',exact:true}).waitFor();await pagina.screenshot({caret:'initial',path:new URL('web-cadastro.png',destino).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await pagina.getByRole('button',{name:'Sair',exact:true}).click();
 const contextoMovel=await navegador.newContext({viewport:{width:390,height:780},isMobile:true,hasTouch:true}),movel=await contextoMovel.newPage();
 await movel.goto('http://127.0.0.1:8081/acesso');await movel.getByLabel('E-mail',{exact:true}).fill('paciente.a@demo.vivamais.invalid');await movel.getByLabel('Senha',{exact:true}).fill(senha);await movel.getByRole('button',{name:'Entrar',exact:true}).click();await movel.waitForURL('**/inicio');await movel.getByTestId('module-blood-pressure').waitFor();await movel.getByText('✓ Conexão com a API confirmada',{exact:false}).waitFor();await movel.screenshot({caret:'initial',path:new URL('app-inicio-expo-web.png',destino).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await movel.getByRole('button',{name:'Sair da minha conta',exact:true}).click();
 console.log('Quatro screenshots reais capturadas. Captura Expo web não equivale a teste em dispositivo nativo.');
}finally{await navegador.close();}
