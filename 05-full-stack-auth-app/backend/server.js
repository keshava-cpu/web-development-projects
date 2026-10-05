// import the installed `express` module
import exp from "express";

// Create and return (more than just) HTTP server
const app = exp();
// Assign the port number
const port = 5757;
app.listen(port, () => console.log(`server listening on port ${port}`));

// Creating APIs
// route to handle GET req
app.get();
// route to handle POST req
app.post();
// route to handle PUT req
app.put();
// route to handle DELETE req
app.delete();
