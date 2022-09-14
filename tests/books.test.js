process.env.NODE_ENV = "test";
const request = require('supertest')
const app = require('../app')
const db = require('../db')

const Book = require('../models/book')
const jsonschema = require('jsonschema')
const bookSchema = require('../schema/book.Schema.json')
const ExpressError = require('../expressError')



    beforeEach(async  function () {
        await db.query('DELETE FROM books');
       
        
        let b1 = await Book.create({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          })

    })


describe('POST /books', function() {
    test('should create a new book with correct validators', async function () {
        let d1 = {
            "isbn": "0691161517",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          }

        let response = await request(app).post('/books').send(d1)
        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual(expect.objectContaining({}))
         

    })

    test('should respond with 400 with invalid validators', async function () {
        let d2 = {
        
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          }
          let response = await request(app).post('/books').send(d2)
          expect(response.statusCode).toBe(400)
          expect(response.body).toEqual(expect.objectContaining({"error": {
            "message": [ "instance requires property \"isbn\"",], "status": 400, },
            "message": [
            "instance requires property \"isbn\"",
             ]
        }))


    })
})

describe("GET /books", function () {
    test("Gets a list of 1 book", async function () {
      const response = await request(app).get(`/books`);
      const books = response.body.books;
      expect(books).toHaveLength(1);
      expect(books[0]).toHaveProperty("isbn");
      expect(books[0]).toHaveProperty("amazon_url");
    });
  });

  describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
      const response = await request(app)
          .get(`/books/0691161518`)
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.isbn).toBe("0691161518");
    });
  
    test("Responds with 404 if can't find book in question", async function () {
      const response = await request(app)
          .get(`/books/999`)
      expect(response.statusCode).toBe(404);
    });
  });

  describe("PUT /books/isbn", function () {
    test("Updates a single book", async function () {
        let d1 = {
            "isbn": "0691161517",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "UPDATED BOOK",
            "year": 2017
          }
      const response = await request(app)
          .put('/books/0691161518')
          .send(d1)
      
      expect(response.body.book.title).toBe("UPDATED BOOK");
    });
  
    test("Prevents a bad book update", async function () {
        let d1 = {
            "isbn": "0691161517",
            "amazon_url": 5,
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "UPDATED BOOK",
            "year": 2017
          }
      const response = await request(app)
          .put(`/books/0691161518`)
          .send(d1);
      expect(response.statusCode).toBe(400);
    });
  
 
  });



  describe("DELETE /books/isbn", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app)
          .delete(`/books/0691161518`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
  });
  

afterAll(async function () {
  await db.end();
 });

