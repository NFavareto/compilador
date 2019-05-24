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

module.exports.getCloseBlock = async function getCloseBlock(lexical) {
  const block = {
    i: null,
    j: null,
    status: false,
  }

  let i
  let j

  for (i = 0; i < lexical.length; i++) {
    for (j = 0; j < lexical[i].tokens.length; j++) {
      if (lexical[i].tokens[j].name === 't_fecha_colchete') {
        block.j = j
        block.i = i
        block.status = true
      }
    }
  }
  return block
}

module.exports.getBlock = async function getBlock(lexical, initial, finish) {
  const lines = []
  let dataLine = {
    number: '',
    tokens: '',
  }

  for (let i = initial; i < finish + 1; i++) {
    dataLine = {
      number: lexical[i].number,
      tokens: lexical[i].tokens,
    }
    lines.push(dataLine)
    dataLine = {
      number: '',
      tokens: '',
    }
  }

  return lines
}


module.exports.getBlocks = async function getBlocks(lexical) {
  const data = []
  for (let i = 0; i < lexical.length; i++) {
    for (let j = 0; j < lexical[i].tokens.length; j++) {
      if (lexical[i].tokens[j].name === 't_abr_colchete') {
        // verifica se é um comentario em bloco e salva
        // eslint-disable-next-line no-await-in-loop
        const block = await this.getCloseBlock(lexical)
        if (block.status) {
          // eslint-disable-next-line no-await-in-loop
          const _block = await this.getBlock(lexical, i, block.i)
          data.push(_block)
        }
      }
    }
  }

  return data
}

// Verify Errors
module.exports.verifyExpression = async function verifyExprCession(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if ((dataLine[index].name === 't_identificador')
      && (dataLine[index + 1].name !== 't_atribuicao'
      && dataLine[index + 1].name !== 't_ptvg'
      && dataLine[index + 1].name !== 't_soma'
      && dataLine[index + 1].name !== 't_subtracao'
      && dataLine[index + 1].name !== 't_mult'
      && dataLine[index + 1].name !== ' t_divisao')) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um identificador espera-se um "=", um  ";" ou algum operador aritmético.'
      }

      if (dataLine[index].name === 't_atribuicao'
          && (dataLine[index + 1].name !== 't_numberInt'
            && dataLine[index + 1].name !== 't_numberFloat '
            && dataLine[index + 1].name !== 't_numberExp '
            && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "=" espera-se um numero ou um identificador'
      }


      if ((dataLine[index].name === 't_numberInt'
          || dataLine[index].name === 't_numberFloat'
          || dataLine[index].name === 't_numberExp')
            && (dataLine[index + 1].name !== 't_ptvg'
            && dataLine[index + 1].name !== 't_soma'
            && dataLine[index + 1].name !== 't_subtracao'
            && dataLine[index + 1].name !== 't_mult'
            && dataLine[index + 1].name !== 't_divisao')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um numero espera-se um  ";" ou qualquer operador aritmético.'
      }


      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
    if (dataLine[index + 1] === undefined && dataLine[index] !== undefined) {
      if ((dataLine[index].name === 't_identificador')
        && (dataLine[index + 1] === undefined)) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um identificador espera-se um "=", um  ";" ou algum operador aritmético.'
      }

      if ((dataLine[index].name === 't_numberInt'
      || dataLine[index].name === 't_numberFloat'
      || dataLine[index].name === 't_numberExp')
      && (dataLine[index + 1] === undefined)) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um numero espera-se um  ";" ou qualquer operador aritmético.'
      }


      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }
  return errors
}

module.exports.verifyTypes = async function verifyTypes(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if ((dataLine[index].name === 't_int'
      || dataLine[index].name === 't_float'
      || dataLine[index].name === 't_exp')
      && (dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um tipo de variavel espera-se um identificador '
      }

      if (dataLine[index].name === 't_identificador'
          && (dataLine[index + 1].name !== 't_atribuicao'
            && dataLine[index + 1].name !== 't_ptvg')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um identificador espera-se um "=" ou ";"'
      }


      if (dataLine[index].name === 't_atribuicao'
          && (dataLine[index + 1].name !== 't_numberInt'
            && dataLine[index + 1].name !== 't_numberFloat '
            && dataLine[index + 1].name !== 't_numberExp '
            && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "=" espera-se um numero ou um identificador'
      }


      if ((dataLine[index].name === 't_numberInt'
          || dataLine[index].name === 't_numberFloat'
          || dataLine[index].name === 't_numberExp')
            && dataLine[index + 1].name !== 't_ptvg') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um numero espera-se um  ";"'
      }


      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
    if (dataLine[index + 1] === undefined && dataLine[index] !== undefined) {
      if ((dataLine[index].name === 't_int'
      || dataLine[index].name === 't_float'
      || dataLine[index].name === 't_exp')
      && (dataLine[index + 1] === undefined)) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um tipo de variavel espera-se um identificador '
      }

      if ((dataLine[index].name === 't_numberInt'
      || dataLine[index].name === 't_numberFloat'
      || dataLine[index].name === 't_numberExp')
      && (dataLine[index + 1] === undefined)) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um número espera-se um ";" '
      }


      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }
  return errors
}

module.exports.verifyIf = async function verifyIf(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'if' && dataLine[index + 1].token !== '(') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "if" espera-se um "(" '
      }
      if (dataLine[index].name === 't_abr_parenteses' && (dataLine[index + 1].name !== 't_numberInt'
            && dataLine[index + 1].name !== 't_numberFloat'
            && dataLine[index + 1].name !== 't_numberExp'
            && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de "(" espera-se um número um identificador'
      }

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
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um número ou identificador espera-se uma operação relacional ou um ")"'
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
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de uma operação relacional espera-se um número ou identificador'
      }

      if (dataLine[index].token === ')' && dataLine[index + 1].token !== '{') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de um ")" espera-se um "{" '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
    if (dataLine[index + 1] === undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'if' && dataLine[index + 1] === undefined) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um "if" espera-se um "(" '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }
  return errors
}

module.exports.verifyElse = async function verifyElse(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === '{' && dataLine[index + 1].token !== undefined) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "{" espera-se uma cadeia vazia ou nada '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
    if (dataLine[index + 1] === undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'else' && dataLine[index + 1] === undefined) {
        error.code = `Trecho do código: ${dataLine[index].token}`
        error.msg = 'Depois de um "else" espera-se um "{" '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }
  return errors
}

module.exports.verifyWhile = async function verifyWhile(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'while' && dataLine[index + 1].token !== '(') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "while" espera-se um "(" '
      }

      /**  while ( comparacao ) */
      /** ( identificador
       * ( numero
       * */
      if (dataLine[index].name === 't_abr_parenteses' && (dataLine[index + 1].name !== 't_numberInt'
            && dataLine[index + 1].name !== 't_numberFloat'
            && dataLine[index + 1].name !== 't_numberExp'
            && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de "(" espera-se um numero ou identificador'
      }

      /**
       * numero op_relacional
       * identificador op_relacional
       * identificador op_logico
       * numero op_logico
       * identificador )
       * numero )
       *  */
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
        && dataLine[index + 1].name !== 't_and'
        && dataLine[index + 1].name !== 't_or'
        && dataLine[index + 1].token !== ')')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um número ou identificador espera-se uma operação relacional  , uma  operação lógica ou um ")"'
      }

      // op_relacional numero ou op_relacional identificador
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
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de uma operação relacional espera-se um número ou identficador'
      }

      /**
       * op_logico numero
       * op_logico identificador
       */
      if ((dataLine[index].name === 't_and'
        || dataLine[index].name === 't_or')
        && (dataLine[index + 1].name !== 't_numberInt'
        && dataLine[index + 1].name !== 't_numberFloat'
        && dataLine[index + 1].name !== 't_numberExp'
        && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de uma operação lógica espera-se um número ou identificador'
      }


      // ) {
      if (dataLine[index].token === ')' && dataLine[index + 1].token !== '{') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de um ")" espera-se um "{" '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }

  return errors
}

module.exports.verifyFor = async function verifyFor(dataLine, indexLine) {
  let error = {
    code: '',
    msg: '',
  }
  const errors = []
  for (let index = indexLine; index < dataLine.length; index++) {
    if (dataLine[index + 1] !== undefined && dataLine[index] !== undefined) {
      if (dataLine[index].token === 'for' && dataLine[index + 1].token !== '(') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "for" espera-se um "(" '
      }

      /**  for ( atribuicao ; comparacao ; identificador op_incremento ) */
      /** ( int
       * ( float
       * ( exponencial
       * */
      if (dataLine[index].name === 't_abr_parenteses'
        && (dataLine[index + 1].name !== 't_int'
            && dataLine[index + 1].name !== 't_float'
            && dataLine[index + 1].name !== 't_exp')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um "("  espera-se um tipo de variavel int, float ou exponencial'
      }


      // atribuicao
      /**
       * int identificador
       * float identificador
       * exp identificador
       *  */
      if ((dataLine[index].name === 't_int'
        || dataLine[index].name === 't_float'
        || dataLine[index].name === 't_exp')
        && (dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um tipo de variavel espera-se um numero ou um identificador'
      }

      /**
       * numero op_atribuicao
       * numero op_relacional
       * numero ;
       */

      if ((dataLine[index].name === 't_numberInt'
        || dataLine[index].name === 't_numberFloat'
        || dataLine[index].name === 't_numberExp')
        && (dataLine[index + 1].name !== 't_maior'
        && dataLine[index + 1].name !== 't_menor'
        && dataLine[index + 1].name !== 't_maiorouigual'
        && dataLine[index + 1].name !== 't_menorouigual'
        && dataLine[index + 1].name !== 't_diferente'
        && dataLine[index + 1].name !== 't_igual'
        && dataLine[index + 1].name !== 't_ptvg')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um numero espera-se uma operação relacional, uma atribuição, ou um ";"'
      }

      /**
       * identificador op_atribuicao
       * identificador op_relacional
       * identificador ;
       * identificador ++
       * identificador --
       */

      if ((dataLine[index].name === 't_identificador')
        && (dataLine[index + 1].name !== 't_maior'
        && dataLine[index + 1].name !== 't_menor'
        && dataLine[index + 1].name !== 't_maiorouigual'
        && dataLine[index + 1].name !== 't_menorouigual'
        && dataLine[index + 1].name !== 't_diferente'
        && dataLine[index + 1].name !== 't_igual'
        && dataLine[index + 1].name !== 't_atribuicao'
        && dataLine[index + 1].name !== 't_ptvg'
        && dataLine[index + 1].name !== 't_decrementa'
        && dataLine[index + 1].name !== 't_incrementa')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = 'Depois de um  identificador espera-se uma operação relacional, uma atribuição, um decremento, um incremento ou um ";"'
      }

      /**
       *  op atribuicao identificador
       *  op atribuicao numero
       */
      if ((dataLine[index].name === 't_atribuicao'
        || dataLine[index].name === 't_maior'
        || dataLine[index].name === 't_menor'
        || dataLine[index].name === 't_maiorouigual'
        || dataLine[index].name === 't_menorouigual'
        || dataLine[index].name === 't_diferente'
        || dataLine[index].name === 't_igual')
        && (dataLine[index + 1].name !== 't_numberInt'
        && dataLine[index + 1].name !== 't_numberFloat'
        && dataLine[index + 1].name !== 't_numberExp'
        && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de uma operação de atribuição ou uma operação relacional,  espera-se um número ou identficador'
      }

      /**
       * ; identificador
       * ; numero
       */
      if ((dataLine[index].name === 't_ptvg')
        && (dataLine[index + 1].name !== 't_numberInt'
        && dataLine[index + 1].name !== 't_numberFloat'
        && dataLine[index + 1].name !== 't_numberExp'
        && dataLine[index + 1].name !== 't_identificador')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de um ";" espera-se um número ou identficador'
      }


      /**
       * ++ )
       * -- )
       */
      if ((dataLine[index].name === 't_incrementa'
        || dataLine[index].name === 't_decrementa')
        && (dataLine[index + 1].name !== 't_fecha_parenteses')) {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de uma operação de incrementar ou decrementar espera-se um ")"'
      }


      // ) {
      if (dataLine[index].token === ')' && dataLine[index + 1].token !== '{') {
        error.code = `Trecho do código: ${dataLine[index].token} ${dataLine[index + 1].token}`
        error.msg = ' Depois de um ")" espera-se um "{" '
      }
      if (error.code !== '') {
        errors.push(error)
      }
      error = {
        code: '',
        msg: '',
      }
    }
  }

  return errors
}


module.exports.getErrors = async function getErrors(dataLines) {
  // percorro as linhas
  const resultErrors = []
  let errorLine = {
    line: '',
    errors: [],
  }
  let errors = []
  for (let indexLines = 0; indexLines < dataLines.length; indexLines++) {
    // percorro os tokens da linha que estous
    if (dataLines[indexLines].tokens) {
      const dataLine = dataLines[indexLines].tokens
      for (let indexLine = 0; indexLine < dataLine.length; indexLine++) {
        switch (dataLine[indexLine].name) {
          case 't_divisao':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyExpression(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_multi':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyExpression(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_subtracao':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyExpression(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_soma':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyExpression(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_atribuicao':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyExpression(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_int':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyTypes(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_float':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyTypes(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_exp':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyTypes(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_if':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyIf(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }

            break

          case 't_else':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyElse(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_while':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyWhile(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break

          case 't_for':
            // eslint-disable-next-line no-await-in-loop
            errors = await this.verifyFor(dataLine, indexLine)
            if (errors.length > 0) {
              errorLine.line = dataLines[indexLines].number
              errorLine.errors = errors
              resultErrors.push(errorLine)
            }
            errorLine = {
              line: '',
              errors: [],
            }
            break
          default:
            break
        }
      }
    }
  }
  return resultErrors
}


module.exports.SyntaxAnalysis = async function SyntaxAnalisys(lexical) {
  const dataLines = await this.removeComments(lexical)
  const resultSyntaxErrors = await this.getErrors(dataLines)
  const teste = await this.getBlocks(dataLines)

  // blocos de  funções - variaveis locais!
  teste.forEach((block, index) => {
    console.log('\nBloco', `${index} - rs ${block}`)
    // block.forEach((line) => {
    //   console.log('\nLinha', line)
    // })
  })

  return resultSyntaxErrors
}
