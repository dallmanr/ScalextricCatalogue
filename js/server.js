var express = require('express');
var app = express();

var db = require('../js/db.js');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

var methodOverride = require('method-override');
app.use(methodOverride('_method'));

var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
// var db = mongoose.connect('mongodb://localhost:27017/christestdb');

var Schema = mongoose.Schema;
var Car = require("../models/car");
var Service = require("../models/service")

var fs = require('fs');

var formidable = require('formidable');
var fs = require('fs');

app.use(express.static('../'));

//Landing Page - Loaded when the user starts the server
app.get('/', function(req, res) {
  // res.sendFile(path.join(__dirname, '/index.html'));
  res.sendFile('index.html', {
    root: '../'
  });
});

//Returns all the cars in the database
app.get('/allcars', function(req, res) {

  Car.find({}, function(err, cars) {
    if (err) {
      res.status(500).send({
        error: "Could not fetch cars"
      });
    } else {
      res.status(200).send(cars)
    }
  })
});
//End of code to return all cars

//Code to obtain the information for one car. This car may be selected via the catalogue number datalist
app.get('/acar/:catnum', function(req, res) {
  var trHTML;
  Car.findOne({
      cat_number: req.params.catnum
    }).populate({
      path: 'services',
      model: 'Service'
    }).exec(function(err, services) {
      if (err) {
        res.status(500).send({
          error: "Could not find service history of car"
        });
      } else {
        res.status(200).send(services);
      }
    }),
    function(err, car) {
      if (err) {
        res.status(500).send({
          error: "Could not find car"
        });
      } else {
        res.status(200).send(car)
      }
    }
});
//End of obtain one cars information code

//The add a new car code via POST. Called from add_a_car.html file
app.post("/addcar", function(req, res) {
  var imagesFolder = "/images/";
  var fullPath = imagesFolder + req.body.imgPathField;
  var newCar = new Car();
  newCar.img_path = fullPath;
  newCar.remarks = req.body.remarksField;
  newCar.cat_number = req.body.catNumberField;
  newCar.ltd_edition = req.body.ltdEditionField;
  newCar.car_manufacturer = req.body.carManufacturerModelField;
  newCar.manufacturer_model = req.body.manufacturerModelField;
  newCar.car_number = req.body.carNumberField;
  newCar.colour = req.body.colourField;
  newCar.type = req.body.carTypeField;
  newCar.model_manufacturer = req.body.modelManufacturerField;
  newCar.cost = req.body.costField;
  newCar.received = req.body.dateObtainedField;
  newCar.source = req.body.sourceField;
  newCar.make = req.body.carMakeField;
  newCar.year = req.body.yearField;
  newCar.img_path = fullPath;
  newCar.save(function(err, savedCar) {
    if (err) {
      res.status(500).send({
        error: "Could not save car " + err
      });
    } else {
      res.status(200).send({
        savedCar
      });
    }
  });
}); //End of add a new car code

//Need a route for creating a new service
app.post('/newservice', function(req, res) {
  var newservice = new Service();
  var serviceId;
  newservice.service_type = req.body.serviceTypeSelect;
  newservice.service_details = req.body.serviceDetailsSelect;
  newservice.service_remarks = req.body.remarksField;

  newservice.save(function(err, newservice) {
    if (err) {
      res.status(500).send({
        error: "Could not create new serivce"
      });
    } else {
      res.status(200).send(newservice);
    }
  });
}); //end of newservice

//Route for adding a new service record to a car
//We want to find the car that is to have a service
//Using the cat_number we can find the car we need.
//Add a service to a specific car
app.post('/service/car/add', function(req, res) {
  var serviceId;
  var carId = req.body.catNumberDropdown;
  var newservice = new Service();
  newservice.service_type = req.body.serviceTypeSelect;
  newservice.service_details = req.body.serviceDetailsSelect;
  newservice.service_remarks = req.body.remarksField;
  newservice.save(function(err, newservice) {
    if (err) {
      res.status(500).send({
        error: "Could not create new serivce"
      });
    } else {
      serviceId = newservice._id;
      Service.findOne({
        _id: serviceId
      }, function(err, service) {
        if (err) {
          res.status(500).send({
            error: "Service not found"
          })
        } else {
          console.log("Service found");
          Car.update({
            cat_number: req.body.catNumberDropdown
          }, {
            $addToSet: {
              services: service._id
            }
          }, function(err, car) {
            if (err) {
              res.status(500).send({
                error: "Could not add service record to car"
              })
            } else {
              // res.status(200).send(service);
              Car.findOne({
                cat_numer: carId
              }).populate({
                path: 'services',
                model: 'Service'
              }).exec(function(err, services) {
                if (err) {
                  res.status(500).send({
                    error: "Could not find service history of car"
                  });
                } else {
                  res.status(200).send(car);
                }
              })
            }
          });
        }
      });
    };
  });
});//End of adding new service record for car

//Route for getting service record of a car
app.get('/servicehistory/:catnum', function(req, res) {
  Car.findOne({
    cat_number: req.params.catnum
  }).populate({
    path: 'services',
    model: 'Service'
  }).exec(function(err, services) {
    if (err) {
      res.status(500).send({
        error: "Could not find service history of car"
      });
    } else {
      res.status(200).send(services);
    }
  });
});//End of service history route

//Route for updating a car in the database
// Take the data from the form
// Find the car in the database based on catalogue number
// Update the fields when submitted
app.put('/update/car/:catnum', function(req, res) {
  var imagesFolder = "/images/";
  var fullPath = imagesFolder + req.body.imgPathField;
  Car.findOne({
    cat_number: req.params.catnum
  }, function(err, car) {
    if (err) {
      res.status(500).send({
        error: "Car not found"
      });
    } else {
      console.log("Car found " + car);
      Car.update({
          cat_number: req.params.catnum
        }, {
          $set: {
            cat_number: req.params.catnum,
            car_number: req.body.catNumberField,
            car_manufacturer: req.body.carManufacturerModelField,
            car_number: req.body.carNumberField,
            cat_number: req.body.catNumberDropdown,
            color: req.body.colourField,
            cost: req.body.costField,
            img_path: fullPath,
            ltd_edition: req.body.ltdEditionField,
            make: req.body.carMakeField,
            manufacturer_model: req.body.manufacturerModelField,
            model_manufacturer: req.body.modelManufacturerField,
            received: req.body.yearField,
            source: req.body.sourceField,
            type: req.body.carTypeField,
            remarks: req.body.remarksField,
          }
        },
        function(err, car) {
          if (err) {
            console.log("Not updated " + err);
            res.status(500).send({
              error: "Car not updated " + err
            })
          } else {
            res.status(200).send(car);
          }
        })
    }
  });
});// End of update route

//Route for deleting a car from the catalogue
app.delete('/deletecar/:catnum', function(req, res) {
  var catNumber = req.params.catnum;
  var query = {
    cat_number: catNumber
  };

  Car.remove(query, function(err, obj) {
    if (err) {
      res.status(500).send({
        error: "Car not removed: " + err
      })
    } else {
      res.status(200).send(obj);
    }
  })
});//End of the delete route

//Starts the server and listens on the given port
app.listen(3000, function() {
  console.log("Chris' running on port 3000");
});
//End of server starting code
