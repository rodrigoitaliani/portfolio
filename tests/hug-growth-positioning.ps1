$html = Get-Content -Raw (Join-Path $PSScriptRoot '..' 'index.html')
@(
  'Growth Comercial, Revenue Operations & GTM Engineering',
  'FOURP',
  'EcoRenova',
  'Momix Engenharia',
  'Pezzette Loro'
) | ForEach-Object {
  if ($html -notmatch [regex]::Escape($_)) { throw "Conteúdo ausente: $_" }
}
