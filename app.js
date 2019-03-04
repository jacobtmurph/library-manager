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
    })
    .catch(err => {
        if (err.name === "SequelizeValidationError") {
            res.render('new-book', {
                book: Book.build(req.body), 
                title: "Create a new Book",
                errors: err.errors,
            });
        } else {
            res.render('error', {error: err.errors, title: "Page Not Found"})
        }
    });
});

app.get('/books/:id', (req, res) => {
    Book.findById(req.params.id).then( book => {
        res.render('update-book', {book: book, title: book.title})
    }).catch(err => {
        const notFoundErr = new Error('Not found');
        notFoundErr.status = 404;
        res.render('page-not-found', {error: notFoundErr, title: "Page Not Found"});
    });
});

app.post('/books/:id', (req, res) => {
    Book.findById(req.params.id).then(book => {
        return book.update(req.body);
    })
    .then(book => res.redirect(`/books/${book.id}`))
    .catch(err => {
        if (err.name === "SequelizeValidationError") {
            const book = Book.build(req.body);
            book.id = req.params.id;

            res.render('update-book', {
                book: book, 
                title: "Edit Book",
                errors: err.errors,
            });
        } else {
            res.render('error', {error: err.errors, title: "Page Not Found"})
        }
    });;
});

app.post('/books/:id/delete', (req, res) => {
    Book.findById(req.params.id).then(book => book.destroy())
    .then(() => res.redirect('/books'));
});

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status);
    if (err.status == 404) {
        res.render('page-not-found', {error: err, title: "Page Not Found"});
    } else {
        res.render('error', {error: err, title: "Page Not Found"});
    };
});

app.listen(port, () => console.log(`App running on port ${port}`));

