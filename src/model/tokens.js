
const specialCharacters = {
  t_ptvg: { name: 't_ptvg', token: ';', status: true },
  t_pt: { name: 't_pt', token: '.', status: true },
  t_abr_parenteses: { name: 't_abr_parenteses', token: '(', status: true },
  t_fecha_parenteses: { name: 't_fecha_parenteses', token: ')', status: true },
  t_abr_colchete: { name: 't_abr_colchete', token: '{', status: true },
  t_fecha_colchete: { name: 't_abr_parenteses', token: '}', status: true },
  t_comentario_simples: { name: 't_comentario_simples', token: '//', status: true },
  t_abr_comentario_composto: { name: 't_abr_comentario_composto', token: '/*', status: true },
  t_fecha_comentario_composto: { name: 't_fecha_comentario_composto', token: '*/', status: true },
  t_identificador: { name: 't_identificador', token: '/^[aA-zZ]+$/g', status: true },
}

const operators = {
  t_atribuicao: { name: 't_atribuicao', token: '=', status: true },
  t_incrementa: { name: 't_incrementa', token: '++', status: true },
  t_decrementa: { name: 't_decrementa', token: '--', status: true },
  t_maior: { name: 't_maior', token: '>', status: true },
  t_menor: { name: 't_menor', token: '<', status: true },
  t_maiorouigual: { name: 't_maiorouigual', token: '>=', status: true },
  t_menorouigual: { name: 't_menorouigual', token: '<=', status: true },
  t_diferente: { name: 't_diferente', token: '!=', status: true },
  t_igual: { name: 't_igual', token: '==', status: true },
  t_soma: { name: 't_soma', token: '+', status: true },
  t_subtracao: { name: 't_subtracao', token: '-', status: true },
  t_multi: { name: 't_multi', token: '*', status: true },
  t_divisao: { name: 't_divisao', token: '/', status: true },
  t_and: { name: 't_and', token: '&&', status: true },
  t_or: { name: 't_or', token: '||', status: true },
}

const reservedWords = {
  t_if: { name: 't_if', token: 'if', status: true },
  t_else: { name: 't_else', token: 'else', status: true },
  t_for: { name: 't_for', token: 'for', status: true },
  t_while: { name: 't_while', token: 'while', status: true },
  t_int: { name: 't_int', token: 'int', status: true },
  t_float: { name: 't_float', token: 'float', status: true },
  t_exp: { name: 't_exp', token: 'exp', status: true },
  t_inicio: { name: 't_inicio', token: 'comecaaqui', status: true },
  t_fim: { name: 't_fim', token: 'terminaaqui', status: true },
}

const number = {
  t_numberInt: { name: 't_numberInt', token: '^[0-9]+$', status: true },
  t_numberFloat: { name: 't_numberFloat', token: '^\\d*\\.\\d+(\\d+)?$', status: true },
  t_numberExp: { name: 't_numberExp', token: '^[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?$', status: true },
}

const words = {
  t_identificador: { name: 't_identificador', token: '^[aA-zZ]+$', status: true },
}

const specialCharactersRules = {
  r_blockcomment: {
    begin: specialCharacters.t_abr_comentario_composto,
    end: specialCharacters.t_fecha_comentario_composto,
  },
}


// valores que devem ser ignorados na analise lexica e sintatica
const index = "[' '|\n]*"


module.exports = {
  specialCharacters,
  operators,
  reservedWords,
  number,
  words,
  index,
  specialCharactersRules,
}
