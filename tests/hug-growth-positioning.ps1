$root = Join-Path $PSScriptRoot '..'
$html = Get-Content -Raw (Join-Path $root 'index.html')
$js = Get-Content -Raw (Join-Path $root 'index.js')

function Assert-Contains([string]$content, [string]$expected, [string]$context) {
  if ($content -notmatch [regex]::Escape($expected)) {
    throw "Conteúdo ausente ($context): $expected"
  }
}

Assert-Contains $html 'Growth Comercial, Revenue Operations & GTM Engineering' 'posicionamento'
Assert-Contains $html 'Quer estruturar seu Growth Comercial?' 'CTA orientado a Growth'
Assert-Contains $html 'Conecto aquisição, CRM e vendas em uma operação que o time consegue executar.' 'CTA orientado a RevOps'

$cases = @(
  @{ Id = 'fourp'; Name = 'FOURP'; Marker = '4P'; Claims = @('Apollo', 'human-in-the-loop') },
  @{ Id = 'ecorenova'; Name = 'EcoRenova'; Marker = 'ER'; Claims = @('Geração de demanda B2B', 'mídia paga', 'tracking server-side') },
  @{ Id = 'momix_engenharia'; Name = 'Momix Engenharia'; Marker = 'ME'; Claims = @('Google e Meta', 'high-ticket', 'deduplicação', 'captura de eventos no edge') },
  @{ Id = 'pezzette_loro'; Name = 'Pezzette Loro'; Marker = 'PL'; Claims = @('LinkedIn e Google', 'tracking server-side', 'higienização de dados') }
)

foreach ($case in $cases) {
  $cardPattern = '(?s)<div class="project-item(?: active)?" data-project-id="' + $case.Id + '".*?<svg class="project-arrow"'
  $card = [regex]::Match($html, $cardPattern)
  if (-not $card.Success) { throw "Cartão sem o ID coerente: $($case.Name) -> $($case.Id)" }

  Assert-Contains $card.Value 'project-marker' "marcador textual de $($case.Name)"
  Assert-Contains $card.Value $case.Marker "sigla do marcador de $($case.Name)"
  if ($card.Value -match '<img\b') { throw "Cartão de $($case.Name) ainda depende de thumbnail em imagem" }

  Assert-Contains $js ($case.Id + ': {') "dados dinâmicos de $($case.Name)"
  Assert-Contains $html ('template-case-' + $case.Id) "template de $($case.Name)"
  $case.Claims | ForEach-Object { Assert-Contains $html $_ "claim curricular de $($case.Name)" }
}

$fourpCard = [regex]::Match($html, '(?s)<div class="project-item active" data-project-id="fourp".*?<svg class="project-arrow"')
if (-not $fourpCard.Success) { throw 'FOURP deve ser o cartão ativo por padrão' }

Assert-Contains $html 'id="showcase-marker"' 'marcador do showcase'
Assert-Contains $html 'data-current-project="fourp"' 'botão do showcase padrão'
Assert-Contains $js 'let currentProjectId = "fourp"' 'estado inicial do showcase'
Assert-Contains $js 'template-case-${projectId}' 'abertura do template correspondente ao card'
if ($html -match 'id="showcase-hero-img"|data-current-project="agente_sdr"') {
  throw 'O showcase padrão ainda expõe o case legado de Agente de Voz'
}
