@echo off
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
:: O comando 'call' é essencial para o script não fechar aqui
call npm run deploy:github
echo --- Fim do deploy no GitHub Pages...

:: 3. Deploy Vercel
echo --- Fazendo deploy na Vercel...
:: De acordo com seu guia, a Vercel faz o build sozinha, 
:: mas vamos manter seu fluxo de build manual se preferir
call npm run build:vercel
call vercel --prod

echo === TODOS OS DEPLOYS CONCLUIDOS! ===

