param([string]$DocumentPath = 'C:\Users\notel\Downloads\especificacao_plataforma_jornalistica.docx')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($DocumentPath)
try {
    $reader = [IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open())
    try { [xml]$document = $reader.ReadToEnd() } finally { $reader.Dispose() }
} finally { $zip.Dispose() }
$ns = [Xml.XmlNamespaceManager]::new($document.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
function TextOf($node) { return (($node.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '').Trim() }
function EscapeCell([string]$value) { return $value.Replace('|', '\|').Replace('<', '&lt;').Replace('>', '&gt;').Replace("`r", ' ').Replace("`n", ' ') }
$rows = [Collections.Generic.List[string]]::new()
$section = 'Introdução'
$index = 0
$hash = (Get-FileHash -LiteralPath $DocumentPath -Algorithm SHA256).Hash
$rows.Add('# Matriz de requisitos — Newsroom 360')
$rows.Add('')
$rows.Add('Inventário integral dos parágrafos e linhas de tabelas do PRD v1.0. Inclui contexto, alternativas, recomendações e opcionais; presença nesta tabela não transforma um item opcional em obrigatório. As células de cada tabela são mantidas juntas e identificadas pelo cabeçalho. IDs correspondem à ordem do documento; preservar IDs e atualizar manualmente evidências após este inventário inicial.')
$rows.Add('')
$rows.Add("SHA-256 do DOCX: ``$hash``.")
$rows.Add('')
$rows.Add('Nenhuma linha recebe aprovação integral por inferência. O núcleo local cobre parte de vários requisitos; limites e testes executados estão em IMPLEMENTATION_STATUS.md e FINAL_IMPLEMENTATION_REPORT.md. As verificações planejadas abaixo ainda precisam cobrir integralmente cada requisito, inclusive exceções e recursos condicionais.')
$rows.Add('')
$rows.Add('| ID | Requisito / contexto | Documento | Módulo / seção | Implementação | Teste | Status |')
$rows.Add('|---|---|---|---|---|---|---|')
foreach ($node in $document.SelectSingleNode('//w:body', $ns).ChildNodes) {
    if ($node.LocalName -eq 'p') {
        $text = TextOf $node
        if (!$text) { continue }
        if ($text -match '^\d+\.\d*\s' -or $text -match '^Apêndice [A-C]' -or $text -in @('Resumo executivo','Objetivos de negócio','Princípios de produto')) { $section = $text; continue }
        $items = @($text)
    } elseif ($node.LocalName -eq 'tbl') {
        $tableRows = @($node.SelectNodes('./w:tr', $ns))
        $headers = @($tableRows[0].SelectNodes('./w:tc', $ns) | ForEach-Object { TextOf $_ })
        $items = @()
        foreach ($row in $tableRows | Select-Object -Skip 1) {
            $cells = @($row.SelectNodes('./w:tc', $ns) | ForEach-Object { TextOf $_ })
            $parts = for ($i=0; $i -lt $cells.Count; $i++) { "$($headers[$i]): $($cells[$i])" }
            $items += $parts -join '; '
        }
    } else { continue }
    foreach ($text in $items) {
        $index++
        $id = 'PRD-{0:D4}' -f $index
        $implementation = 'Pendente; conferir cobertura parcial no status do módulo'
        $test = 'Planejado: validar este trecho e suas exceções; não aprovado integralmente'
        $rows.Add("| $id | $(EscapeCell $text) | DOCX v1.0 | $(EscapeCell $section) | $implementation | $test | NÃO INICIADO |")
    }
}
$rows.Add('')
$rows.Add('## Controles adicionais do prompt mestre')
$rows.Add('')
$rows.Add('| ID | Requisito | Documento | Módulo | Implementação | Teste | Status |')
$rows.Add('|---|---|---|---|---|---|---|')
$supplements = @(
    @('PM-01','Auditar repositório e manter matriz, status, lacunas e arquitetura','Fase 0','docs/','Inspeção inicial e logs npm preservados','IMPLEMENTADO'),
    @('PM-02','Ciclo análise, implementação, testes, correção e checkpoint por fase','Regra de execução','docs/FINAL_IMPLEMENTATION_REPORT.md','26 testes de domínio/API; E2E documentado no relatório','EM DESENVOLVIMENTO'),
    @('PM-03','Loading, vazio, erro, sucesso, validação, conexão e proteção contra perda por módulo','Padrão de qualidade','src/components/ui.tsx; hooks; editor','Estados de todas as telas ainda exigem auditoria completa','EM DESENVOLVIMENTO'),
    @('PM-04','Checkbox, Radio, Switch, Tooltip, Drawer, Toast, paginação e demais primitives','Fase 1','Design system parcial; componentes ainda pendentes','Suite individual de todos os componentes pendente','EM DESENVOLVIMENTO'),
    @('PM-05','Login, logout, recuperação e alteração de senha, MFA e sessões','Fase 2','src/features/auth/; recuperação/MFA pendentes','Sessão revogada e permissão testadas; controles restantes pendentes','EM DESENVOLVIMENTO'),
    @('PM-06','Executar lint, typecheck, unit, integration, E2E e build reais','Bloco global','package.json; src/tests/; e2e/','Resultados reais no relatório do checkpoint','EM DESENVOLVIMENTO'),
    @('PM-07','Teste de dupla publicação e ações repetidas','Teste de duplo clique','API: Idempotency-Key e transação','Integração: duplicação de criação bloqueada; publicação repetida rejeitada pelo workflow','EM DESENVOLVIMENTO'),
    @('PM-08','Testar 320,375,390,768,1024,1366,1440,1920 e teclado','Responsividade global','src/app/globals.css; e2e/','Login nas oito resoluções; cobertura de todas as telas pendente','EM DESENVOLVIMENTO'),
    @('PM-09','Falhas 500, timeout, offline,401,403,404,429 e recuperação segura','Erro de API e recuperação','src/services/api.ts; API; editor','401,403,409,422 testados; demais cenários parciais','EM DESENVOLVIMENTO'),
    @('PM-10','Não registrar senhas, tokens, cookies, documentos confidenciais ou dados sensíveis','Segredos e logs','Logs técnicos contêm requestId, método e caminho','Revisão de código; auditoria completa de produção pendente','EM DESENVOLVIMENTO'),
    @('PM-11','Nenhuma IA publica ou envia dados confidenciais sem controle','Fase 18','Integração de IA não implementada','Pendente caso o módulo opcional seja habilitado','NÃO INICIADO'),
    @('PM-12','Relatório final, auditoria contra documentos e nenhuma aprovação falsa','Checkpoint final','docs/FINAL_IMPLEMENTATION_REPORT.md','Entrega local explicitamente não homologada para produção','EM DESENVOLVIMENTO')
)
foreach ($item in $supplements) { $rows.Add("| $($item[0]) | $($item[1]) | Prompt mestre: $($item[2]) | Transversal | $($item[3]) | $($item[4]) | $($item[5]) |") }
$rows.Add('')
$rows.Add("Total inventariado do DOCX: $index trechos/linhas de tabela. O status inicial conservador evita atribuir implementação completa a um parágrafo com múltiplos critérios. Antes de aprovar um requisito, decompor critérios compostos e vincular a testes específicos.")
[IO.File]::WriteAllLines((Join-Path (Get-Location) 'docs/REQUIREMENTS_MATRIX.md'), $rows, [Text.UTF8Encoding]::new($false))
Write-Output "Matriz gerada: $index itens PRD e $($supplements.Count) controles adicionais."
