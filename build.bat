@echo off
title Otimizacao para Producao - Juntos por Todos
chcp 65001 >nul

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                🚀 OTIMIZAÇÃO PARA PRODUÇÃO                     ║
echo ║                    Juntos por Todos                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verifica se o Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 📋 Para usar as otimizações, você precisa instalar o Node.js:
    echo    1. Baixe em: https://nodejs.org/
    echo    2. Escolha a versão LTS
    echo    3. Execute o instalador
    echo    4. Reinicie o terminal e execute este script novamente
    echo.
    echo 📄 Consulte o arquivo INSTALLATION_GUIDE.md para instruções detalhadas
    echo.
    pause
    exit /b 1
)

REM Verifica se o npm está disponível
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    echo    O npm geralmente vem com o Node.js. Reinstale o Node.js.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
node --version
npm --version
echo.

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas!
    echo.
)

REM Menu principal
:menu
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                          MENU PRINCIPAL                        ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ 1. 🚀 Build completo (recomendado)                            ║
echo ║ 2. 🎨 Build apenas CSS                                        ║
echo ║ 3. ⚡ Build apenas JavaScript                                 ║
echo ║ 4. 📄 Build apenas HTML                                       ║
echo ║ 5. 🖼️  Build apenas imagens                                   ║
echo ║ 6. 🧹 Limpar build anterior                                   ║
echo ║ 7. 🌐 Testar versão de desenvolvimento                        ║
echo ║ 8. 🚀 Testar versão de produção                              ║
echo ║ 9. ❌ Sair                                                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set /p choice="Digite sua escolha (1-9): "

if "%choice%"=="1" goto build_all
if "%choice%"=="2" goto build_css
if "%choice%"=="3" goto build_js
if "%choice%"=="4" goto build_html
if "%choice%"=="5" goto build_images
if "%choice%"=="6" goto clean
if "%choice%"=="7" goto dev_server
if "%choice%"=="8" goto prod_server
if "%choice%"=="9" goto exit

echo ❌ Opção inválida! Tente novamente.
echo.
goto menu

:build_all
echo.
echo 🚀 Executando build completo...
call npm run build
if %errorlevel% equ 0 (
    echo.
    echo ✨ Build completo finalizado com sucesso!
    echo 📁 Arquivos otimizados disponíveis na pasta 'dist\'
) else (
    echo ❌ Erro durante o build!
)
echo.
pause
goto menu

:build_css
echo.
echo 🎨 Executando build do CSS...
call npm run build:css
echo.
pause
goto menu

:build_js
echo.
echo ⚡ Executando build do JavaScript...
call npm run build:js
echo.
pause
goto menu

:build_html
echo.
echo 📄 Executando build do HTML...
call npm run build:html
echo.
pause
goto menu

:build_images
echo.
echo 🖼️ Executando build das imagens...
call npm run build:images
echo.
pause
goto menu

:clean
echo.
echo 🧹 Limpando build anterior...
call npm run clean
echo ✅ Limpeza concluída!
echo.
pause
goto menu

:dev_server
echo.
echo 🌐 Iniciando servidor de desenvolvimento...
echo    Acesse: http://localhost:3000
echo    Pressione Ctrl+C para parar o servidor
echo.
call npm run dev
goto menu

:prod_server
if not exist "dist" (
    echo ❌ Build de produção não encontrado!
    echo    Execute primeiro a opção 1 (Build completo)
    echo.
    pause
    goto menu
)
echo.
echo 🚀 Iniciando servidor de produção...
echo    Acesse: http://localhost:3001
echo    Pressione Ctrl+C para parar o servidor
echo.
call npm run prod
goto menu

:exit
echo.
echo 👋 Obrigado por usar as otimizações de produção!
echo.
pause
exit /b 0