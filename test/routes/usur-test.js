var expect = require('chai').expect;  
var request = require('supertest');  
var mongoose = require('mongoose');  
var mockgoose = require('mockgoose');

mockgoose(mongoose);  
var app = require('../../app');
