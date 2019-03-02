const express = require('express');
const bodyParser = require('body-parser');
const Book = require('./models').Book;

const app = express();

const port = 3000;

app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));

app.use('/static', express.static('public'));

app.get('/', (req, res) => res.redirect('/books'));

app.get('/books', (req, res) => {
    Book.findAll({order: [["title", "ASC"]]}).then(
        (bookList) => res.render('index', {books: bookList, title: "Books"})
    );
});

app.get('/books/new', (req, res) => {
    res.render('new-book', {book: Book.build(), title: "Create a new Book"});
});

app.post('/books/new', (req, res) => {
    Book.create(req.body).then( book => {
        res.redirect(`/books/${book.id}`);
    });
});

app.get('/books/:id', (req, res) => {
    Book.findById(req.params.id).then( book => {
        res.render('update-book', {book: book, title: book.title})
    });
});

app.post('/books/:id', (req, res) => {
    Book.findById(req.params.id).then(book => {
        return book.update(req.body);
    })
    .then(book => res.redirect(`/books/${book.id}`));
});

app.post('/books/:id/delete', (req, res) => {
    Book.findById(req.params.id).then(book => book.destroy())
    .then(() => res.redirect('/books'));
});

app.listen(port, () => console.log(`App running on port ${port}`));

