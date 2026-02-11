@echo off
:: Arquivo em lote para deploy nas plataformas.
:: Verifica se uma mensagem foi passada como argumento
if "%~1"=="" (
    set /p msg="Digite a mensagem do commit: "
) else (
    set msg=%~1
)

echo === INICIANDO DEPLOY DUPLO (GITHUB + VERCEL) ===

:: 1. Git Push (Código-fonte)
echo --- Enviando codigo para o GitHub com a mensagem: "%msg%"
git add .
git commit -m "%msg%"
git push origin master

:: 2. Deploy GitHub Pages
echo --- Fazendo deploy no GitHub Pages...
npm run deploy:github

:: 3. Deploy Vercel ( comando anterior: npm run deploy:vercel)
echo --- Fazendo deploy na Vercel...
npm run build:vercel
vercel --prod

echo === TODOS OS DEPLOYS CONCLUIDOS! ===
pause
