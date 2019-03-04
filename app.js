//Required packages & database models.

const express = require('express');
const bodyParser = require('body-parser');
const Book = require('./models').Book;

//Set the app object.
const app = express();
//Set the port the app should run on.
const port = 3000;

//Set pug as default templating engine.
app.set('view engine', 'pug');

//Use parsing for the req.body object.
app.use(bodyParser.urlencoded({extended: true}));

//Use provided static files.
app.use('/static', express.static('public'));

//Get the index page, which redirects to the books list.
app.get('/', (req, res) => res.redirect('/books'));

//Render a list of all the books, with opions to edit and create new books.
app.get('/books', (req, res) => {
    Book.findAll({order: [["title", "ASC"]]}).then(
        (bookList) => res.render('index', {books: bookList, title: "Books"})
    );
});

//Get the new book form.
app.get('/books/new', (req, res) => {
    res.render('new-book', {book: Book.build(), title: "Create a new Book"});
});

//Add the new book to the database.
app.post('/books/new', (req, res) => {
    Book.create(req.body).then( book => {
        //And redirect to its edit page.
        res.redirect(`/books/${book.id}`);
    })
    //If there's an error.
    .catch(err => {
        //And it is a validation error (i.e. missing required fields).
        if (err.name === "SequelizeValidationError") {
            //Re-render the form, with user friendly error messages.
            res.render('new-book', {
                book: Book.build(req.body), 
                title: "Create a new Book",
                errors: err.errors,
            });
            //Else:
        } else {
            //Render the default Errors page.
            res.render('error', {error: err.errors, title: "Page Not Found"})
        }
    });
});

//Get the book editing form.
app.get('/books/:id', (req, res) => {
    Book.findById(req.params.id).then( book => {
        res.render('update-book', {book: book, title: book.title})
        //If the requested book does not exist:
    }).catch(err => {
        //Set and return a 404 error.
        const notFoundErr = new Error('Not found');
        notFoundErr.status = 404;
        //Display the 404 error page.
        res.render('page-not-found', {error: notFoundErr, title: "Page Not Found"});
    });
});

//Submit the edits to an already existing book.
app.post('/books/:id', (req, res) => {
    Book.findById(req.params.id).then(book => {
        return book.update(req.body);
    })
    //And redirect to its edit page.
    .then(book => res.redirect(`/books/${book.id}`))
    //If there's an error:
    .catch(err => {
        //And it's a validation error (i.e. missing required fields):
        if (err.name === "SequelizeValidationError") {
            //Auto-fill the required forms.
            const book = Book.build(req.body);
            //Set the book id to that of the book to be edited.
            book.id = req.params.id;

            //Display the edit form with user-friendly error messages.
            res.render('update-book', {
                book: book, 
                title: "Edit Book",
                errors: err.errors,
            });
            //Else:
        } else {
            //Render the default Error page.
            res.render('error', {error: err.errors, title: "Page Not Found"})
        }
    });;
});

//Delete a given book.
app.post('/books/:id/delete', (req, res) => {
    Book.findById(req.params.id).then(book => book.destroy())
    //And redirect to the book list page.
    .then(() => res.redirect('/books'));
});

//If a user tries to access a non-existent page:
app.use((req, res, next) => {
    //Create & Set a 404 Error.
    const err = new Error('Not Found');
    err.status = 404;
    //Pass the 404 to the error handler.
    next(err);
});

//If there is an error:
app.use((err, req, res, next) => {
    //Set the response status of the page to the error status.
    res.status(err.status);
    //If the error is a 404:
    if (err.status == 404) {
        //Display a user-friendly 404 page, with means to navigate back to the book list.
        res.render('page-not-found', {error: err, title: "Page Not Found"});

    //Else:
    } else {
        //Display a standard Error page.
        res.render('error', {error: err, title: "Page Not Found"});
    };
});

//Set the app to listen on the set port, and notify the server admin which port is in use.
app.listen(port, () => console.log(`App running on port ${port}`));

