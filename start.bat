@REM Ensure "initiated" file exists
@ECHO OFF

title Gelbooru Downloader

if not exist initiated (
    ECHO Project not initiated, initiating initiation..
    call initiate.bat
)

start dll.bat