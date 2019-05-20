module.exports.getCommentBlock = async function getCommentBlock(lexical) {
  // apenas um fecha comentario
  const block = {
    i: null,
    j: null,
    status: false,
  }

  let i
  let j

  for (i = 0; i < lexical.length; i++) {
    for (j = 0; j < lexical[i].symbols.length; j++) {
      if (lexical[i].symbols[j].name === 't_fecha_comentario_composto') {
        block.j = j
        block.i = i
        block.status = true
      }
    }
  }
  return block
}


module.exports.removeComments = async function removeComments(lexical) {
  const data = []
  for (let i = 0; i < lexical.length; i++) {
    const lineData = {
      number: lexical[i].line,
      tokens: [],
    }
    for (let j = 0; j < lexical[i].symbols.length; j++) {
      // verifica comentario simples e ignora
      if (lexical[i].symbols[j].name === 't_comentario_simples') {
        j = lexical[i].symbols.length
      } else if (lexical[i].symbols[j].name === 't_abr_comentario_composto') {
        // verifica se é um comentario em bloco e ignora
        const commentBlock = this.getCommentBlock(lexical)
        if (commentBlock.status) {
          j = commentBlock.j
          i = commentBlock.i
        }
      } else if (lexical[i].symbols[j].name !== 't_indexIgnore' && lexical[i].symbols[j].name !== 't_invalido') {
        const token = {
          name: lexical[i].symbols[j].name,
          token: lexical[i].symbols[j].token,
          status: lexical[i].symbols[j].status,
        }
        lineData.tokens.push(token)
      }
    }
    if (lineData.tokens.length > 0) { data.push(lineData) }
  }

  return data
}

module.exports.verifyIf = async function verifyIf(dataLine, indexLine) {
  // if ( y == x ) {
  let error = ''
  const errors = []
  const auxIndex = indexLine
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'if' && dataLine[index + 1].token !== '(') { error = 'Depois de um "if" espera-se um "(" ' }
      if (dataLine[index].name === 't_abr_parenteses' && (dataLine[index + 1].name !== 't_numberInt'
            && dataLine[index + 1].name !== 't_numberFloat'
            && dataLine[index + 1].name !== 't_numberExp'
            && dataLine[index + 1].name !== 't_identificador')) { error = 'Depois de um "(" espera-se um número ou um identificador' }

      if ((dataLine[index].name === 't_numberInt'
        || dataLine[index].name === 't_numberFloat'
        || dataLine[index].name === 't_numberExp'
        || dataLine[index].name === 't_identificador')
        && (dataLine[index + 1].name !== 't_maior'
        && dataLine[index + 1].name !== 't_menor'
        && dataLine[index + 1].name !== 't_maiorouigual'
        && dataLine[index + 1].name !== 't_menorouigual'
        && dataLine[index + 1].name !== 't_diferente'
        && dataLine[index + 1].name !== 't_igual'
        && dataLine[index + 1].token !== ')')) {
        error = 'Depois de um número ou identicador espera-se uma operação relacional ou um ")"'
      }

      if ((dataLine[index].name === 't_maior'
        || dataLine[index].name === 't_menor'
        || dataLine[index].name === 't_maiorouigual'
        || dataLine[index].name === 't_menorouigual'
        || dataLine[index].name === 't_diferente'
        || dataLine[index].name === 't_igual')
        && (dataLine[index + 1].name !== 't_numberInt'
        && dataLine[index + 1].name !== 't_numberFloat'
        && dataLine[index + 1].name !== 't_numberExp'
        && dataLine[index + 1].name !== 't_identificador')) {
        error = 'Depois de uma operação relacional espera-se um número ou identicador'
      }

      if (dataLine[index].token === ')' && dataLine[index + 1].token !== '{') { error = 'Depois de um ")" espera-se um "{" ' }

      errors.push(error)
      error = ''
    }
  }
  const data = {
    errors,
  }
  return data
}

module.exports.teste = async function teste(dataLines) {
  // percorro as linhas
  const data = []
  for (let indexLines = 0; indexLines < dataLines.length; indexLines++) {
    console.log(`${dataLines[indexLines].number}\n`)

    // percorro os tokens da linha que estou
    if (dataLines[indexLines].tokens) {
      const dataLine = dataLines[indexLines].tokens
      for (let indexLine = 0; indexLine < dataLine.length; indexLine++) {
        if (dataLine[indexLine].token === 'if') {
          // eslint-disable-next-line no-await-in-loop
          const result = await this.verifyIf(dataLine, indexLine)
          indexLine = result.auxIndex
          console.log('ERROS DO IF', result.errors)
        }
      }
    }
  }

  return data
}


module.exports.SyntaxAnalysis = async function SyntaxAnalisys(lexical) {
  const dataLines = await this.removeComments(lexical)
  await this.teste(dataLines)
}
