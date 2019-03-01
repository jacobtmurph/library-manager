const express = require('express');
const Book = require('./models').Book;

const app = express();

const port = 3000;

app.set('view engine', 'pug');
app.use('/static', express.static('public'));

app.get('/', (req, res) => res.redirect('/books'));

app.get('/books', (req, res) => {
    Book.findAll({order: [["title", "ASC"]]}).then(
        (bookList) => res.render('index', {books: bookList, title: "Books"})
    );
});

app.get('/books/:id', (req, res) => {
    res.render('book', {book: Book.findById(req.params.id), title: Book.findById(req.params.id).title});
});

app.listen(port, () => console.log(`App running on port ${port}`));

