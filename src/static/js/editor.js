
/* eslint-disable func-names */

/** Functions for Lexical Analysis */

// In lexical analysis, the block comment  is ignored.
function getCommentBlock(analysis) {
  // apenas um fecha comentario
  const block = {
    i: null,
    j: null,
    status: false,
  }

  let i
  let j

  for (i = 0; i < analysis.lexical.length; i++) {
    for (j = 0; j < analysis.lexical[i].symbols.length; j++) {
      if (analysis.lexical[i].symbols[j].name === 't_fecha_comentario_composto') {
        block.j = j
        block.i = i
        block.status = true
      }
    }
  }

  return block
}

// If token doesn't exists, is a lexical error.
async function getLexicalErrors(analysis) {
  const errors = []

  for (let i = 0; i < analysis.lexical.length; i++) {
    for (let j = 0; j < analysis.lexical[i].symbols.length; j++) {
      console.log(analysis.lexical[i].symbols[j].name)
      if (analysis.lexical[i].symbols[j].name === 't_invalido') {
        const error = {
          msg: '',
          token: '',
          line: 0,
          column: 0,
        }
        error.msg = 'Erro Léxico - Token inválido'
        error.line = i
        error.token = analysis.lexical[i].symbols[j].token
        errors.push(error)
        console.log('TOKEN', analysis.lexical[i].symbols[j].token)
      }
    }
  }
  console.log(errors.length)
  return errors
}


function getTable(analysis) {
  for (let i = 0; i < analysis.lexical.length; i++) {
    for (let j = 0; j < analysis.lexical[i].symbols.length; j++) {
      // verifica comentario simples
      if (analysis.lexical[i].symbols[j].name === 't_comentario_simples') {
        j = analysis.lexical[i].symbols.length
      } else if (analysis.lexical[i].symbols[j].name === 't_abr_comentario_composto') {
        const commentBlock = getCommentBlock(analysis)
        if (commentBlock.status) {
          j = commentBlock.j
          i = commentBlock.i
        }
      } else if (analysis.lexical[i].symbols[j].name !== 't_indexIgnore' && analysis.lexical[i].symbols[i].name !== 't_invalido') {
        $('#tabela #tabelaSimbolos #tabelaSimbolos-corpo').append(`<tr>
              <th scope="row">${analysis.lexical[i].symbols[j].name}</th>
              <th scope="row">${analysis.lexical[i].symbols[j].token}</th>
              </tr>`)
      }
    }
  }
}

/** View Manipulation */

function uploadCodeInEditorSection(textOriginal) {
  const linhas = textOriginal.replace(/(?:\r\n|\r|\n)/g, '\n').split('\n')

  let textReturn = ''

  for (i in linhas) {
    textReturn += `<div>${linhas[i]}</div>`
  }
  return textReturn
}


function drawLines() {
  const maxLinha = $('#linha > div').length + ($('#linha').html().indexOf('<div>') === 0 ? 0 : 1)
  const linhasDesenhadas = $('#numeracao > input').length

  // criando numeração pras linhas
  for (let i = linhasDesenhadas; i < maxLinha; i++) {
    $('#numeracao').append(`<input 
          id="contador_linha" 
          type="button" 
          class="btn btn-sm  p-0 m-0" 
          style="color:#848484; background:#1e1e1e;"
          value="${i + 1}" >`)
  }

  // Apaga as Linhas que não existem mais!
  if (linhasDesenhadas > maxLinha) {
    for (let i = maxLinha + 1; i <= linhasDesenhadas; i++) {
      $(`#numeracao input#contador_linha[value="${i}"]`).remove()
    }
  }
}


async function getHeaderTable() {
  $('#tabela').html('')
  $('#tabela').text('')
  $('#tabela').html(` 
          <table id="tabelaSimbolos" class="table table-center table-striped">
              <thead class='thead-dark'>
                  <tr>
                      <th scope="col">Cadeia</th>
                      <th scope="col">Token</th>
                  </tr>
              </thead>
              <tbody id="tabelaSimbolos-corpo">
              </tbody>
          </table>    
      `)
}

(($, undefined) => {
  $.fn.setCursorPosition = function (pos) {
    this.each((index, elem) => {
      if (elem.setSelectionRange) {
        elem.setSelectionRange(pos, pos)
      } else if (elem.createTextRange) {
        const range = elem.createTextRange()
        range.collapse(true)
        range.moveEnd('character', pos)
        range.moveStart('character', pos)
        range.select()
      }
    })
    return this
  }
})(jQuery)

$(document).ready(() => {
  // trazendo o foco para a primeira linha
  $('#linha').text('').focus()
  $('#linha').addClass('p-color-back')
  $('#linha').css('color', '#ababab')
  $('#linha').append('<br>')

  drawLines()
})

$('#linha').on('input', () => {
  drawLines()
})

$('input[type=file]').bind('change', function () {
  if (this.files.length !== 1) return

  const file = this.files[0]

  const reader = new FileReader()
  reader.onload = function (e) {
    if (e.target.result.indexOf('data:text/plain;base64,') !== 0) {
      console.error('Falha ao ser o arquivo, não é um texto!')
      return
    }

    const textFile = window.atob(e.target.result.replace('data:text/plain;base64,', '').trim())
    $('#linha').html(uploadCodeInEditorSection(textFile)).focus()
    drawLines()
  }
  reader.readAsDataURL(file)
})

$('#linha').keydown((e) => {
  const code = e.keyCode || e.which
  if (code === '9') {
    const original = $(window.getSelection().getRangeAt(0).startContainer).text()
    const pos = window.getSelection().getRangeAt(0).startOffset
    const novo = `${original.substr(0, pos)}    ${original.substr(pos)}`

    $(window.getSelection().getRangeAt(0).startContainer).text(novo)
    $(window.getSelection().getRangeAt(0).startContainer).setCursorPosition(pos + 4)
    // $(window.getSelection().getRangeAt(0).startContainer).text();
    console.log(e.type, pos, original, '->', novo)
    // $("#linha").trigger($.Event({type: 'keypress', which: 32, key: ' ', charCode: 32, keyCode: 32}));
    // console.log("Posicao:", $(this).getCursorPosition());
    return false
  }
  return true
})

$('#console').change(() => {
  console.log('mudouuuuuuuu')
})

$('#compilar').click(() => {
  const codigo = $('#linha').html()

  $.ajax({
    url: '/analises',
    method: 'post',
    data: { codigo },
    success: (analysis) => {
      getHeaderTable()
      console.log(analysis)
      getLexicalErrors(analysis).then((errors) => {
        console.log(errors.length)
        let logError = ''
        for (let i = 0; i < errors.length; i++) {
          console.log('here')
          logError += `<strong>${errors[i].msg}</strong>: ${errors[i].token}<br>`
        }

        // cria tabela aqui
        for (let i = 0; i < analysis.lexical.length; i++) {
          for (let j = 0; j < analysis.lexical[i].symbols.length; j++) {
            // verifica comentario simples
            if (analysis.lexical[i].symbols[j].name === 't_comentario_simples') {
              j = analysis.lexical[i].symbols.length
            } else if (analysis.lexical[i].symbols[j].name === 't_abr_comentario_composto') {
              const commentBlock = getCommentBlock(analysis)
              if (commentBlock.status) {
                j = commentBlock.j
                i = commentBlock.i
              }
            } else if (analysis.lexical[i].symbols[j].name !== 't_indexIgnore' && analysis.lexical[i].symbols[j].name !== 't_invalido') {
              $('#tabela #tabelaSimbolos #tabelaSimbolos-corpo').append(`<tr>
                    <th scope="row">${analysis.lexical[i].symbols[j].name}</th>
                    <th scope="row">${analysis.lexical[i].symbols[j].token}</th>
                    </tr>`)
            }
          }
        }

        // limpar o log antes de alimentar

        for (let i = 0; i < errors.length; i++) { // retirando a classe
          $('#numeracao input#contador_linha').removeClass('bg-danger')
        }

        for (let i = 0; i < errors.length; i++) {
          // eslint-disable-next-line radix
          $(`#numeracao input#contador_linha[value="${parseInt(errors[i].line)}"]`).addClass('bg-danger')
        }

        $('#console').text('')
        $('#console').html(`<br> ${logError}`)
      })
    },
  })
})
