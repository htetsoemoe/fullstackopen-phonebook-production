require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static("dist"))
app.use(cors())
const PORT = process.env.PORT || 3001

// using morgan - HTTP request logger middleware for node.js
morgan.format("reqFormat", (tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        req.method === 'POST' ? JSON.stringify(req.body) : '',
    ].join(" ")
})

app.use(morgan("reqFormat"))

app.get('/', (req, res) => {
    res.status(200).json({ msg: "Hello World form Phone Book" })
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then((persons) => {
        res.status(200).json(persons)
    })
})

app.get('/info', async (req, res) => {
    const date = new Date()
    const count = await Person.countDocuments()
    res.send(`
        <p>Phonebook has info for ${count} people</p> 
        <p>${date}</p>
    `)
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            if (person) {
                res.status(200).json(person)
            } else {
                res.status(404).json({ message: "User not found!" })
            }
        })
        .catch((error) => next(error)) // using default error handling
})

// const generateId = () => {
//     const maxId = persons.length > 0
//         ? Math.max(...persons.map(person => person.id))
//         : 0
//     return maxId + 1
// }

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (body.name === undefined) {
        return res.status(400).json({ message: "missing name" })
    }

    if (body.number === undefined) {
        return res.status(400).json({ message: "missing number" })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then((savedPerson) => {
            res.status(201).json(savedPerson)
        })
        .catch((error) => next(error)) // using default error handling

    // if (persons.find(person => person.name === body.name)) {
    //     return res.status(400).json({ error: "name must be unique." })
    // } else if (!body.name) {
    //     return res.status(400).json({ error: "name is missing." })
    // } else if (!body.number) {
    //     return res.status(400).json({ error: "number is missing." })
    // }

    // const person = {
    //     id: generateId(),
    //     name: body.name,
    //     number: body.number
    // }

    // persons = persons.concat(person) //Combines two or more arrays. This method returns a new array without modifying any existing arrays
    // res.status(201).json(person)   
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch((error) => next(error))

    // const id = Number(req.params.id)
    // persons = persons.filter(person => person.id !== id)
    // res.status(204).end()
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    console.log(req.params.id)
    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then((updatedPerson) => {
            res.status(200).json(updatedPerson)
        })
        .catch((error) => next(error))
})

// Unknown Endpoint Error Handler Middleware
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" })
}

// Default Error Handler Middleware (must be the last middleware of server)
const errorHandler = (error, req, res, next) => {
    console.log("error handler", error.name, error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

// this middleware must place before default error handler middleware
app.use(unknownEndpoint)

// Default Error Handler Middleware (must be the last middleware of server)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
