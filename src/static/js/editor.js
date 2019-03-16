function desenharLinhas() {
  const maxLinha = $('#linha > div').length + ($('#linha').html().indexOf('<div>') == 0 ? 0 : 1)
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

// Função para criar linhas ao carregar a página
$(document).ready(() => {
  // trazendo o foco para a primeira linha
  $('#linha').text('').focus()
  $('#linha').addClass('p-color-back')
  $('#linha').css('color', '#ababab')
  $('#linha').append('<br>')

  desenharLinhas()
})


$('#linha').on('input', () => {
  desenharLinhas()
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
})


function text2DivShow(textOriginal) {
  const linhas = textOriginal.replace(/(?:\r\n|\r|\n)/g, '\n').split('\n')

  let textReturn = ''
  linhas.forEach((linha) => {
    textReturn += `<div>${linha}</div>`
  })

  return textReturn
}


// // Função de descobrir a posição do cursor
// (function ($, undefined) {
//   $.fn.setCursorPosition = function (pos) {
//     this.each((index, elem) => {
//       if (elem.setSelectionRange) {
//         elem.setSelectionRange(pos, pos)
//       } else if (elem.createTextRange) {
//         const range = elem.createTextRange()
//         range.collapse(true)
//         range.moveEnd('character', pos)
//         range.moveStart('character', pos)
//         range.select()
//       }
//     })
//     return this
//   }
// }(jQuery))
