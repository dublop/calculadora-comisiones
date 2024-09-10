import { useEffect, useState } from 'react'
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
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [paralelo, setParalelo] = useState(0)
  const [bcv, setBcv] = useState(0)
  const [resultado, setResultado] = useState(false)
  const {banco, monto} = initialState

  useEffect(() => {
    const apiCall = async() => {
      try {
        let res = await fetch('https://pydolarve.org/api/v1/dollar?page=alcambio')
        let data = await res.json()
        setParalelo(data.monitors.enparalelovzla.price)
        setBcv(data.monitors.bcv.price)
        setDate(data.datetime.date)
        setTime(data.datetime.time)
        return data
      } catch(error){
        console.error('Error al acceder a la API: ', error)
      }
    }
    
    apiCall()
  },[])

  const handleForm = (name, value) => {
    setInitialState ((prevState) => {
        return {
          ...prevState,
          [name]: value
        }
      })
  }

  const calcularComisionRetiro = (data, bcv) => {
    const {banco, monto} = data
    const comisionCompraMasRetiro = ((parseFloat(monto)*bcv)*BANCOS[banco].todo).toFixed(2)
    const comisionDeRetiro = ((parseFloat(monto)*bcv)*BANCOS[banco].retiro).toFixed(2)
    //const cantidadEnBsParaComprar = comisionCompraMasRetiro - comisionDeRetiro
  
    const newData = {
      'Comision de retiro': parseFloat(comisionDeRetiro),
      'Total en bs para comprar y retirar': parseFloat(comisionCompraMasRetiro)
    }

    return setResultado(newData)
  }

  const porcentajeBrechaParaleloBcv = (banco, paralelo, bcv) => {
    const resultado = ((paralelo - (bcv * BANCOS[banco].todo)) / paralelo) * 100
    return resultado.toFixed(2)
  }

  return (
    <>
      <h4>{date} - {time}</h4>
      <ul>
        <li>Tasa BCV: {bcv}</li>
        <li>Tasa Paralelo: {paralelo}</li>
      </ul>
      <h3>Brecha BCV - Paralelo: {porcentajeBrechaParaleloBcv(initialState.banco, paralelo, bcv)}%</h3>
      <hr />
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

        <button onClick={() => calcularComisionRetiro(initialState, bcv)} type='button'>Calcular</button>
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

    
    </>
  )
}

export default App
