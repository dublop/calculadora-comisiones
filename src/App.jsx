import { useState } from 'react'
//import './App.css'

const BANCOS = {
  mercantil: {todo: 1.035, retiro: 0.03},
  bancamiga: {todo: 1.037, retiro: 0.03},
  venezuela: {todo: 1.043, retiro: 0.038}
}

const TASA_BCV = 36.63
const TASA_PARALELO = 44.02

const initialData = {
  banco: 'mercantil',
  monto: '',
}

function App() {
  const [initialState, setInitialState] = useState(initialData)
  const [resultado, setResultado] = useState(false)
  const {banco, monto} = initialState

  const handleForm = (name, value) => {
    setInitialState ((prevState) => {
        return {
          ...prevState,
          [name]: value
        }
      })
  }

  const calcularComisionRetiro = (data) => {
    const {banco, monto} = data
    const comisionCompraMasRetiro = ((parseFloat(monto)*TASA_BCV)*BANCOS[banco].todo).toFixed(2)
    const comisionDeRetiro = ((parseFloat(monto)*TASA_BCV)*BANCOS[banco].retiro).toFixed(2)
    //const cantidadEnBsParaComprar = comisionCompraMasRetiro - comisionDeRetiro
  
    const newData = {
      'Comision de retiro': parseFloat(comisionDeRetiro),
      'Total en bs para comprar y retirar': parseFloat(comisionCompraMasRetiro)
    }

    return setResultado(newData)
  }

  const porcentajeBrechaParaleloBcv = (banco) => {
    const resultado = ((TASA_PARALELO - (TASA_BCV * BANCOS[banco].todo)) / TASA_PARALELO) * 100
    return resultado.toFixed(2)
  }

  return (
    <>
      <h1>Calculadora Comisión Intervención</h1>
      <form onSubmit={e => e.preventDefault()}>
        <p>
          <input type="radio" name="banco" id="mercantil" value="mercantil" checked={banco === 'mercantil'} onChange={e => handleForm(e.target.name, e.target.value)}/>
          <label htmlFor="mercantil">Banco Mercantil</label>
        </p>
        <p>
          <input type="radio" name="banco" id="venezuela" value="venezuela" checked={banco === 'venezuela'} onChange={e => handleForm(e.target.name, e.target.value)}/>
          <label htmlFor="venezuela">Banco de Venezuela</label>
        </p>
        <p>
          <input type="radio" name="banco" id="bancamiga" value="bancamiga" checked={banco === 'bancamiga'} onChange={e => handleForm(e.target.name, e.target.value)}/>
          <label htmlFor="bancamiga">Bancamiga</label>
        </p>

        <label htmlFor="monto">Monto a comprar:</label>
        <input type="text" id='monto' name='monto' value={monto} onChange={e => handleForm(e.target.name, e.target.value)}/>

        <button onClick={() => calcularComisionRetiro(initialState)} type='button'>Calcular</button>
      </form>

      <ul>
      {
        resultado 
        &&
        Object.entries(resultado).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong> {value}
        </li>
      ))}
    </ul>

    <h3>Brecha Paralelo - BCV: {porcentajeBrechaParaleloBcv(initialState.banco)}%</h3>
    </>
  )
}

export default App
