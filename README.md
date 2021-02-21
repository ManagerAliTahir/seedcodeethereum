# seedcodeethereum
for SeedCode

npm start on base directory to start controller.js and cron.js

scripts contains 3 files


Controller.js = 2 controllers for saving and getting data from dynamo DB

seedCode.js = main program that fetches blocks from ethereum -> get transactions of it -> get adi for it and call controller for saving data in dynamo DB

cron.js = scheduler for triggering seedCode.js for latest 200 blocks
