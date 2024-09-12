import { useEffect, useState } from 'react'
//import './App.css'

const BANCOS_INTERVENCION = {
  mercantil: {todo: 1.035, retiro: 0.03},
  bancamiga: {todo: 1.037, retiro: 0.03},
  venezuela: {todo: 1.043, retiro: 0.038}
}
const BANCOS_MENUDEO = {
  mercantil: {todo: 1.042, retiro: 0.03},
  venezuela: {todo: 1.05, retiro: 0.038}
}

const initialData = {
  banco: 'mercantil',
  monto: '',
}



function App() {
  const [initialState, setInitialState] = useState(initialData)
  const [options, setOptions] = useState('intervencion')
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

  const calcularComisionRetiro = (data, bcv, operacion) => {
    const {banco, monto} = data

    if (banco === '' || monto === '') return

    const bancoCominisionTodo = operacion === 'intervencion' ? BANCOS_INTERVENCION[banco].todo : BANCOS_MENUDEO[banco].todo
    const bancoCominisionRetiro = operacion === 'intervencion' ? BANCOS_INTERVENCION[banco].retiro : BANCOS_MENUDEO[banco].retiro

    
    const comisionCompraMasRetiro = ((parseFloat(monto) * bcv) * bancoCominisionTodo).toFixed(2)
    const comisionDeRetiro = ((parseFloat(monto) * bcv)* bancoCominisionRetiro).toFixed(2)
  
    const newData = {
      'Comision de retiro': comisionDeRetiro,
      'Total en bs para comprar y retirar': comisionCompraMasRetiro
    }

    return setResultado(newData)
  }

  const porcentajeBrechaParaleloBcv = (banco, paralelo, bcv, operacion) => {
    const bancoOperacion = (operacion === 'intervencion') ? BANCOS_INTERVENCION[banco].todo : BANCOS_MENUDEO[banco].todo
    const resultado = ((paralelo - (bcv * bancoOperacion)) / paralelo) * 100
    return resultado.toFixed(2)
  }

  const handleOptions = (option) => {
    setOptions(option)
    setInitialState(initialData)
    setResultado(false)
  }

  return (
    <>
      <section className="dolar-data">
        <h4>{date} - {time}</h4>
        <ul>
          <li>Tasa BCV: {bcv}</li>
          <li>Tasa Paralelo: {paralelo}</li>
        </ul>
        <h3>Brecha BCV - Paralelo: {porcentajeBrechaParaleloBcv(initialState.banco, paralelo, bcv, options)}%</h3>
      </section>

      <hr />
      <section className="options">
        <button onClick={() => handleOptions('intervencion')}>Internción</button>
        <button onClick={() => handleOptions('menudeo')}>Menudeo</button>

      </section>

      {
        options == 'intervencion' 
        &&
        <section className="cambio-intervencion">
          <h2>Calculadora Comisión Intervención</h2>
          <form onSubmit={e => e.preventDefault()}>
            <p>
              <input type="radio" name="banco" id="mercantil" value="mercantil" checked={banco === 'mercantil'} onChange={e => handleForm(e.target.name, e.target.value)}/>
              <label htmlFor="mercantil">Banco Mercantil</label>
            </p>
            <p>
              <input type="radio" name="banco" id="venezuela" value="venezuela" checked={banco === 'venezuela'} onChange={e => handleForm(e.target.name, e.target.value)}/>
              <label htmlFor="venezuela">Banco de Venezuela / BNC</label>
            </p>
            <p>
              <input type="radio" name="banco" id="bancamiga" value="bancamiga" checked={banco === 'bancamiga'} onChange={e => handleForm(e.target.name, e.target.value)}/>
              <label htmlFor="bancamiga">Bancamiga</label>
            </p>

            <label htmlFor="monto">Monto a comprar:</label>
            <input type="text" id='monto' name='monto' value={monto} onChange={e => handleForm(e.target.name, e.target.value)}/>

            <button onClick={() => calcularComisionRetiro(initialState, bcv, options)} type='button'>Calcular</button>
          </form>
        </section>
      }

      {
        options == 'menudeo' 
        &&
        <section className="cambio-menudeo">
          <h2>Calculadora Comisión Menudeo</h2>
          <form onSubmit={e => e.preventDefault()}>
            <p>
              <input type="radio" name="banco" id="mercantil" value="mercantil" checked={banco === 'mercantil'} onChange={e => handleForm(e.target.name, e.target.value)}/>
              <label htmlFor="mercantil">Banco Mercantil / Bancamiga</label>
            </p>
            <p>
              <input type="radio" name="banco" id="venezuela" value="venezuela" checked={banco === 'venezuela'} onChange={e => handleForm(e.target.name, e.target.value)}/>
              <label htmlFor="venezuela">Banco de Venezuela / BNC</label>
            </p>

            <label htmlFor="monto">Monto a comprar:</label>
            <input type="text" id='monto' name='monto' value={monto} onChange={e => handleForm(e.target.name, e.target.value)}/>

            <button onClick={() => calcularComisionRetiro(initialState, bcv, options)} type='button'>Calcular</button>
          </form>
        </section>
      }

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
