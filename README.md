Uber Cab App
=================

A small web app to find and book Uber cabs to attend TEDxPESITBSC. It was made for TEDxPESITBSC 2015, though it wasn't officially used.

It launches Uber app with the trip details, if installed, otherwise opens the sign up page on Uber mobile site.

###Demo
A demo of this is live at: [http://tedxcab.us.to](http://tedxcab.us.to)

###Usage
Install dependencies
```shell
$ pip install -r requirements.txt
```

Set environment variable for `uber_server_token`
```shell
export uber_server_token=XXXXXXXXXXXXXX
```

Run the script and see it live at: `http://localhost:5000`
```shell
$ python app.py
 * Running on http://127.0.0.1:5000/
 * Restarting with reloader
```

###Contribute
Feel free to fork and improve upon it. Pull requests welcome!
