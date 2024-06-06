const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log("give password as argument")
    process.exit()
}

const password = process.argv[2]

const url = `mongodb+srv://soemoehtetmdy:${password}@fso-phonebook.ncwcrnm.mongodb.net/?retryWrites=true&w=majority&appName=fso-phonebook`

mongoose.set('strictQuery', false)

mongoose.connect(url)

// Create Person Schema
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// Create Person object using 'Person Schema'
const Person = mongoose.model('Person', personSchema)

console.log('Args length: ', process.argv.length)

let processArgs = () => {
    if (process.argv.length === 3) {
        console.log("Phonebook: ")
        Person.find({}).then((result) => {
            result.forEach((person) => {
                console.log(person.name, person.number)
            })
            // after print all person info, we need to close mongodb connection
            mongoose.connection.close()

        })
    } else if (process.argv.length === 5) {
        console.log("Args: ", process.argv[3], process.argv[4])

        // Create Person Document using process.argv[3] and process.argv[4]
        const person = new Person({
            name: process.argv[3],
            number: process.argv[4]
        })

        // Save Created Person Document to MongoDB
        person.save().then(() => {
            console.log(`added ${person.name} number ${person.number} to phonebook`)
            mongoose.connection.close()
        })
    } else {
        console.log("Invalid number of arguments")
        mongoose.connection.close()
        process.exit(1)
    }
}

processArgs()
