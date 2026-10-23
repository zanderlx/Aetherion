Option Explicit
Dim shell, files, folder, command
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
folder = files.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = folder
command = "node.exe " & Chr(34) & folder & "\scripts\desktop-launcher.js" & Chr(34) & " stop"
On Error Resume Next
shell.Run command, 0, False
If Err.Number <> 0 Then MsgBox "Unable to launch Gallorin. Make sure Node.js 22 or newer is installed and available on PATH.", 16, "Gallorin"
