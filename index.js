// import express
const { query } = require("express");
const express = require("express");

// import bcrypt
const bcrypt = require("bcrypt");
// import session
const session = require("express-session");
// import flash
const flash = require("express-flash");
// menampung express dalam app
const app = express();
// membuat port local host
const port = 5000;

// menjalankan server
app.listen(port, function (req, res) {
  console.log("server berjalan");
});

// set view engine hbs
app.set("view engine", "hbs");

// membaca folder public
app.use("/public", express.static(__dirname + "/public"));
// membaca folder uploads
app.use("/uploads", express.static(__dirname + "/uploads"));

// untuk menampilkkan data objek saat routing post
app.use(express.urlencoded({ extended: false }));

// untuk memanggil file connection database
const db = require("./connection/db");
const { password } = require("pg/lib/defaults");

// untuk memanggil file mutler
const upload = require('./middleware/fileUpload')

// memasukkan flash dan session dalam app.use
app.use(flash())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge : 12 * 3600 * 1000 }
}))

// login
// let isLogin = false;

// data blogs (menampung push data yang diperoleh dari pengisian data <input> di addmyproject.hbs??)
let blogs = [];

// routing get untuk merender data
app.get("/", function (req, res) {
  let data = req.body;
  console.log(req.session);
  db.connect(function (err, client, done) {
    if (err) throw err;


    const query = `SELECT tb_projects.id, author_id, tb_user.name AS author, tb_user.email, tb_projects.name, start_date, end_date, nodejs, nextjs, reactjs, typescript, image, description FROM tb_projects LEFT JOIN tb_user ON tb_projects.author_id = tb_user.id ORDER BY id DESC`
    client.query(query, function (err, result) {
      if (err) throw err;

      let data = result.rows;

      let blogs = data.map(function (data) {
        return {
          ...data,
          duration: getDistanceTime(data.start_date, data.end_date),
          
        };
      });
      // console.log(blogs);
      res.render("index", {isLogin: req.session.isLogin, user: req.session.user, blogs });
    });
  });
});

app.get("/addmyproject", function (req, res) {
  res.render("addmyproject", { blogs });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/project-detail/:id", function (req, res) {
  // console.log(req.params.id);
  
  let id = req.params.id;
  // melakukan koneksi ke database // err untuk menampilkan eror, client untuk query, done untukk mengakhiri query
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_projects WHERE id = ${id}`,
      function (err, result) {
        if (err) throw err;
        done();

        // console.log(result.rows[0]);
        let data = result.rows[0];
        data.datetime = getFullTime(data.posttime);
        data.duration = getDistanceTime(data.start_date, data.end_date);

        res.render("project-detail", { blog: data });
      }
    );
  });
});

app.get("/delete/:id", function (req, res) {
  const id = req.params.id;

  // sambungkan dengan database
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `DELETE FROM tb_projects WHERE id=${id}`,
      function (err, result) {
        if (err) throw err;
        done();

        res.redirect("/");
      }
    );
  });
});

app.get("/editproject/:id", function (req, res) {
  let id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `SELECT * FROM tb_projects WHERE id = ${id};`,
      function (err, result) {
        if (err) throw err;
        done();

        // console.log(result.rows[0]);
        let data = result.rows[0];
        data = {
          ...data,
          start_date : getDate(data.start_date),
          end_date : getDate(data.end_date),
        }


        console.log(data);

        res.render("editproject", { blog: data });
      }
    );
  });

  // try {}

  // catch (err) {console.log(err)}
});

app.post("/editproject/:id", function (req, res) {
  let data = req.body;
  let id = req.params.id;
  console.log(data);

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `UPDATE tb_projects 
    SET name='${data.name}', start_date='${data.start_date}', end_date='${data.end_date}', description='${data.description}', nodejs=${checkbox(data.nodejs)}, nextjs=${checkbox(data.nextjs)}, reactjs=${checkbox(data.reactjs)}, typescript=${checkbox(data.typescript)}, image='${data.image}'
    WHERE id=${id};`

    console.log(query);
    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      // console.log(result.rows[0]);
      // let data = result.rows[0];

      res.redirect("/");
    });
  });
});

app.get ('/login', function (req, res) {
  res.render('login');
});

app.post("/login", function (req, res) {
  let data = req.body;
  // console.log("coba", data.inputPassword);
  // return console.log(hashedPassword);

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(`SELECT * FROM public.tb_user WHERE email ='${data.email}'`, function (err, result) {
      if (err) throw err;
      done();

      console.log(result);

      if (result.rows.length == 0) {
        req.flash("danger", "Email belum terdaftar ");
        return res.redirect("/login");
      }
      let isMatch = bcrypt.compareSync(data.password, result.rows[0].password);
      console.log(isMatch);

      if (isMatch) {
        (req.session.isLogin = true),
          (req.session.user = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
          });
        req.flash("success", "Login Succes");
        res.redirect("/");
      } else {
        req.flash("danger", "Password Salah");
        res.redirect("/login");
      }
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
});

app.get ('/register', function (req, res) {
  res.render('register');
});

app.post ('/register', function (req, res) {
  let data = req.body
  // console.log(data)
  // meng-encrypt password
  const hashedPassword = bcrypt.hashSync(data.password, 10)

  console.log('pass lama', data.password);
  console.log('pass encript', hashedPassword); 

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_user(name, email, password) VALUES ('${data.name}', '${data.email}', '${hashedPassword}');`;


    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      // console.log(result.rows[0]);
      // let data = result.rows[0];

      res.render('login');
    });
  });


  
});

// routing untuk memasukkkan data kedalam database

app.post("/addmyproject", upload.single('image'), function (req, res) {
  let data = req.body;
  authorId = req.session.user.id
  const image = req.file.filename

  // sambungkan dengan database
  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(
      `INSERT INTO tb_projects(name, start_date, end_date, description, image, nodejs, nextjs, reactjs, typescript, author_id) VALUES('${
        data.name
      }', '${data.start_date}', '${data.end_date}', '${data.description}', '${image}', ${checkbox(data.nodejs)}, ${checkbox(data.nextjs)}, ${checkbox(
        data.reactjs
      )}, ${checkbox(data.typescript)}, ${authorId})`,
      function (err, result) {
        if (err) throw err;
        done();

        res.redirect("/");
      }
    );
  });

  // data.duration = getDistanceTime(data.start_date, data.end_date)

  // blogs.push(data)
  // console.log (blogs)
});

// fungsi untuk durasi
function getDistanceTime(start, end) {
  let start_date = new Date(start);
  let end_date = new Date(end);

  let distance = end_date - start_date; // miliseconds

  let monthDistance = Math.floor(distance / (30 * 24 * 60 * 60 * 1000));

  if (monthDistance != 0) {
    return monthDistance + " months ago";
  } else {
    let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000));
    if (dayDistance != 0) {
      return dayDistance + " days ago";
    } else {
      let hourDistance = Math.floor(distance / (60 * 60 * 1000));

      if (hourDistance != 0) {
        return hourDistance + " hours ago";
      } else {
        let minuteDistance = Math.floor(distance / (60 * 1000));

        if (minuteDistance != 0) {
          return minuteDistance + " minutes ago";
        } else {
          let secondsDistance = Math.floor(distance / 1000);

          return secondsDistance + " second ago";
        }
      }
    }
  }
}

// fungsi fulltime
function getFullTime(waktu) {
  let month = [
    "Januari",
    "Febuari",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "Sept",
    "October",
    "December",
  ];
  let posttime = new Date();
  let date = posttime.getDate();
  console.log(date);

  let monthIndex = posttime.getMonth();
  console.log(month[monthIndex]);

  let year = posttime.getFullYear();
  console.log(year);

  let hours = posttime.getHours();
  let minutes = posttime.getMinutes();

  let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;

  return fullTime;
}

function checkbox(checked) {
  if (checked == "true") {
    return true;
  } else {
    return false;
  }
}

function getDate(tanggal) {
  let date = tanggal.getDate().toString().padStart(2, "0");
  let month = (tanggal.getMonth() + 1).toString().padStart(2, "0");
  let year = tanggal.getFullYear();

  let tanggalan = `${year}-${month}-${date}`;
  return tanggalan;
}
