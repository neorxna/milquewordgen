import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const randomChoice = arr => {
  let index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

const randomArrayOfLength = (len, arr) => {
  let count = len
  let result = []
  while (count > 0) {
    let choice = randomChoice(arr)
    if (result.indexOf(choice) === -1) {
      result.push(choice)
      count -= 1
    }
  }
  return result
}

function weightedRandomSelection(spec) {
  let sumOfWeights = Object.values(spec).reduce((a, b) => { return a + b }, 0)
  let r = Math.random() * sumOfWeights
  let i, sum = 0
  for (i in spec) {
    sum += spec[i]
    if (r <= sum) return i
  }
}

function assignGuseinZadeWeight(arr) {
  var spec = {}  // choices -> weights
  for (var i = 0; i < arr.length; i++) {
    /* Gusein-Zade logarithmic distribution */
    spec[arr[i]] = ((Math.log(arr.length + 1) - Math.log(i + 1)) / arr.length) * 100
  }
  return spec;
}

const pickFrom = (array) => {
  return weightedRandomSelection(assignGuseinZadeWeight(array))
}

const concatMaybe = (x, c, ph, orCond, andCond) => {
  //const roll = randomChoice([0, 1, 2]) === 1
  const res = randomArrayOfLength(randomChoice(c), ph)
  const orFiltered = orCond == null || orCond == {} ? res : res.filter(_ph => {
    let conditions = orCond[_ph]
    return conditions == undefined ||
      conditions.reduce((acc, condition) => (
        acc || x.concat(res).indexOf(condition) !== -1
      ), false)
  })
  const andFiltered = andCond == null || andCond == {} ? orFiltered : orFiltered.filter(_ph => {
    let conditions = andCond[_ph]
    return conditions == undefined ||
      conditions.reduce((acc, condition) => {
        return acc && x.concat(orFiltered).indexOf(condition) !== -1
      }, true)
  })
  return x.concat(andFiltered)
}

const BASE_CONS = [
  'p', 't', 'k',
  'm', 'n',
]

const VOWELS = ['a', 'e', 'i', 'o', 'u']


const liquids = ['r', 'l', 'w', 'y']

const sonorous1 = [
  'y', 'w', 'ɂ'
]

const sonorous2 = sonorous1.concat(['r', 'l'])

const sonorous3 = sonorous2.concat([
  'm', 'n', 'ñ', 'ng', 'v', 'z', 'zh', 'gh'
])
const sonorous4 = sonorous3.concat([
  'f', 's', 'x', 'sh', 'b', 'd', 'g', 'j', 'h', 'qh'
])

const genWord = (strucs, v, c, f) => {
  const rootConsonants = randomArrayOfLength(5, c)
  const numSyllables = randomChoice([2, 3, 4])

  const liqs = c.filter(x => liquids.indexOf(x) !== -1)
  const fins = c.filter(x => f.indexOf(x) !== -1)
  let result = []
  let consIndex = 0
  for (let z = 0; z < numSyllables; z++) {
    let structure = pickFrom(strucs).split('')
    for (let i = 0; i < structure.length; i++) {
      if (structure[i] === 'C') {
        let cchoice = rootConsonants[consIndex]
        if (result.length === 0 || result[result.length - 1] !== cchoice) {
          result.push(cchoice)
          consIndex += 1
        }
      } else if (structure[i] === 'L') {
        let lchoice = randomChoice(liqs)
        if (liqs.length > 0 && (result.length === 0 || result[result.length - 1] !== lchoice)) result.push(lchoice)
      } else if (structure[i] === 'F') {
        // final
        let fchoice = pickFrom(fins)
        if (fins.length > 0 && (result.length === 0 || result[result.length - 1] !== fchoice)) result.push(fchoice)
      } else {
        let vchoice = pickFrom(v)
        /*if (result.length === 0 || result[result.length - 1] !== vchoice)*/
        result.push(vchoice)
      }
    }
  }
  return result
}

function ConlangGenerator() {

  const [consonants, setConsonants] = useState(null)
  const [shuffledVowels, setShuffledVowels] = useState(null)
  const [syllableStructures, setSyllableStructures] = useState(null)
  const [finalConsonants, setFinalConsonants] = useState(null)
  const [sample, setSample] = useState([])

  function generateConsonants(then) {
    let cs = BASE_CONS.concat([])
    cs = concatMaybe(cs, [0, 0, 0, 1, 1, 2, 3, 4], ['ɂ', 'q', 'kp', 'kw'])
    cs = concatMaybe(cs, [1, 2, 2, 3, 3], ['s', 'f', 'h', 'x'], { 'h': ['s', 'f'], 'x': ['s', 'f'] }) // h requires s or f
    cs = concatMaybe(cs, [0, 0, 1, 1, 2, 3, 4], ['v', 'z', 'gh', 'qh'], { 'gh': ['q', 'x'] }, { 'v': ['f'], 'z': ['s'], 'qh': ['q'] }) // 'v' requires 'f'
    cs = concatMaybe(cs, [0, 1, 2, 2, 3, 4, 4, 4, 4], ['b', 'd', 'g', 'gw'], {}, { 'gw': ['kp'], 'b': ['p'], 'd': ['t', 'b'], 'g': ['k', 'b', 'd'] })
    cs = concatMaybe(cs, [0, 1, 1, 2], ['ng', 'ñ'])
    cs = concatMaybe(cs, [0, 1, 1, 2, 3], ['l', 'r', 'w', 'y'])
    setConsonants(cs)
  }

  function generateVowelRanking() {
    setShuffledVowels(randomArrayOfLength(VOWELS.length, VOWELS))
  }

  function generateSyllableStructures() {
    let strucs = ['CV']
    strucs = concatMaybe(strucs, [0, 0, 0, 1], ['VF'])
    strucs = concatMaybe(strucs, [0, 1, 1, 2], ['CVF', 'CVV'])
    strucs = concatMaybe(strucs, [0, 0, 0, 1, 1, 2], ['CVVF', 'CVVV'], {}, { 'CVVF': ['CVV', 'CVF'], 'CVVV': ['CVV'] })

    strucs.sort((a, b) => a.length - b.length)
    setSyllableStructures(strucs)
  }

  function generateFinalConsonants() {
    const finals = randomChoice([
      sonorous1,
      sonorous2,
      sonorous3,
      sonorous4,
      randomArrayOfLength(consonants.length, consonants)
    ])
      .filter(x => consonants.indexOf(x) !== -1)

    setFinalConsonants(finals)
  }

  function genSample() {
    let samples = []
    for (let i = 0; i < 50; i++) {
      samples.push(genWord(syllableStructures, shuffledVowels, consonants, finalConsonants).join(''))
    }
    setSample(samples)
  }

  function newConlang() {
    generateConsonants()
    generateVowelRanking()
    generateSyllableStructures()
  }

  useEffect(() => {
    if (consonants && consonants.length > 0) generateFinalConsonants()
  }, [consonants])

  useEffect(() => {
    if (syllableStructures && shuffledVowels && consonants && finalConsonants) {
      genSample()
    }
  }, [syllableStructures, shuffledVowels, consonants, finalConsonants])

  useEffect(() => {
    generateConsonants()
    generateVowelRanking()
    generateSyllableStructures()
  }, [])

  return <section>
    <div className={'header-div'}>
      <h1>milquewordgen</h1>
      <h2>milquetoast's word generator v0.1</h2>
      <a href='#' className={'newlang-a'} onClick={e => { e.preventDefault(); newConlang() }}>new language</a>
      {sample.length > 0 && <a href='#' onClick={e => { e.preventDefault(); genSample() }} className={'newsample-a'}>new sample</a>}
      <hr />
    </div>
    <table>

      <tr>
        <td style={{ width: '0px' }} className={'header-td'}>Consonants</td>
        <td style={{ width: '0px' }}><a href='#' onClick={e => { e.preventDefault(); generateConsonants() }}>shuffle</a></td>
        <td style={{ width: '100%' }}>{consonants && consonants.join(' ')}</td>
      </tr>
      <tr>
        <td className={'header-td'}>Vowel ranking</td>
        <td><a href='#' onClick={e => { e.preventDefault(); generateVowelRanking() }}>shuffle</a></td>
        <td>{shuffledVowels && shuffledVowels.join(' ')}</td>
      </tr>
      <tr>
        <td className={'header-td'}>Syllable structures</td>
        <td><a href='#' onClick={e => { e.preventDefault(); generateSyllableStructures() }}>shuffle</a></td>
        <td>{syllableStructures && syllableStructures.join(' ')}</td>
      </tr>
      <tr>
        <td className={'header-td'}>Final consonants</td>
        <td>{consonants && <a href='#' onClick={e => { e.preventDefault(); generateFinalConsonants() }}>shuffle</a>}</td>
        <td>{finalConsonants && finalConsonants.join(' ')}</td>
      </tr>
    </table>
    <div>
      <ul>
        {sample && sample.map((line, n) => <li key={`${line}${n}`}>{line}</li>)}
      </ul>
    </div>
  </section>
}

function App() {
  return (
    <div className="App">
      <ConlangGenerator />
    </div>
  );
}

export default App;
