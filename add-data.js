/*
    This script creates the database
    and inserts 8 user details in the collection `profiles`
*/

// import module from `./models/db.js`
const db = require('./models/db.js');

const User = require('./models/UserModel.js');

const Post = require('./models/PostModel.js');

const url = 'mongodb://localhost:27017/ccapdev-animotweet';

/*
    name of the collection (table)
    to perform CRUD (Create, Read, Update, Delete) operations
*/

/*
    calls the function createDatabase()
    defined in the `database` object in `./models/db.js`
*/
// db.createDatabase();

db.connect(url);

/*
    creates an object
*/
var user = {
    avatar: 'dummy.jpg',
    background: 'profile-background.jpg',
    username: 'dummy123',
    password: 'dummy123',
    bio: 'I am a Dummy',
    followers: 1
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);

/*
    creates an object
*/
var user = {
    avatar: 'tiger-avatar.jpg',
    background: 'profile-background.jpg',
    username: 'zelongzhuang',
    password: 'realistic51',
    bio: 'Coding is Lyf',
    followers: 8
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);

/*
    creates an object
*/
var user = {
    avatar: 'eliana.jpg',
    background: 'profile-background.jpg',
    username: 'elianaMisa',
    password: '12Credentials34',
    bio: 'Chili oil advocate',
    followers: 3
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);

/*
    creates an object
*/
var user = {
    avatar: 'tiffany.jpg',
    background: 'profile-background.jpg',
    username: 'tiffanyAnneSo',
    password: '119oginsys999',
    bio: 'InSyS advocate (char)',
    followers: 9
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);

/*
    creates an object
*/
var user = {
    avatar: 'sir.jpg',
    background: 'profile-background.jpg',
    username: 'sirArren',
    password: 'computervisionpython765',
    bio: 'CCAPDEV professor',
    followers: 213
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);

/*
    creates an object
*/
var user = {
    avatar: 'usg.jpg',
    background: 'profile-background.jpg',
    username: 'USG',
    password: 'announceGSU99',
    bio: 'The official Facebook account of the De La Salle University - University Student Government Managed by the Office of the Executive Secretary',
    followers: 4500
};
/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(User, user, function() {
    console.log('Success');
    }
);











/*
    creates an object
*/
var post = {
    username: 'USG',
    date: '04/29/2021',
    avatar: 'usg.jpg',
    postContent: '[USG ANNOUNCE] Lasallians! Excess payments made during Term 2, AY 2020-2021 shall be automatically credited for Term 3, AY 2020-2021.Students may opt to manually request for refund by accomplishing bit.ly/Refund_Term_2_AY2021 not later than April 24, 2021. Refunds shall be released via fund or wire transfer with bank charges shouldered by the requestor. Please be guided accordingly.',
    likes: 30,
    likers: ['zelongzhuang', 'tiffanyAnneSo', 'elianaMisa'],
    tags: ['University Announce', 'USG'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'USG',
    date: '04/28/2021',
    avatar: 'usg.jpg',
    postContent: '[𝐒𝐮𝐫𝐯𝐞𝐲 𝐨𝐧 𝐒𝐭𝐮𝐝𝐞𝐧𝐭𝐬 𝐒𝐢𝐭𝐮𝐚𝐭𝐢𝐨𝐧 𝐚𝐦𝐢𝐝𝐬𝐭 𝐒𝐩𝐢𝐤𝐞 𝐢𝐧 𝐂𝐎𝐕𝐈𝐃-𝟏𝟗 𝐂𝐚𝐬𝐞𝐬 𝐚𝐧𝐝 𝐄𝐂𝐐 𝐄𝐱𝐭𝐞𝐧𝐬𝐢𝐨𝐧] Hi, Lasallians!In response to the rising number of COVID-19 cases in the country, the on-going implementation of Enhanced Community Quarantine (ECQ) over the NCR+ Area, and the numerous calls for an Academic Break, the University Student Government has released a survey in order to consult the student body on their current situation and their recommendation on the action proposal that the USG will present to the Administration.Link: http://bit.ly/USG2021ECQSurvey We encourage all students to participate in this survey as we are targeting to reach at least 2,000 responses from the student body. Thank you and stay safe!', 
    likes: 30,
    likers: ['zelongzhuang', 'tiffanyAnneSo', 'elianaMisa'],
    tags: ['USG'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'tiffanyAnneSo',
    date: '04/29/2021',
    avatar: 'tiffany.jpg',
    postContent: 'InSys student struggles: them: Ano course mo?me: IS<br>them: Internation Studies?<br>me: :(((( Information Systems<br>them: ano yun?<br>:((((((((', 
    likes: 30,
    tags: ['Information Systems', 'CCS', 'Meme'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'tiffanyAnneSo',
    date: '04/27/2021',
    avatar: 'tiffany.jpg',
    postContent: 'InSys student struggles: <br>them: Ano course mo?me: IS<br>them: Internation Studies?<br>me: :(((( Information Systems<br>them: ano yun?<br>:((((((((', 
    likes: 30,
    tags: ['Information Systems', 'CCS', 'Meme'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'tiffanyAnneSo',
    date: '04/30/2021',
    avatar: 'tiffany.jpg',
    postContent: 'Im so excited for the future of our ISANDE project >v<', 
    likes: 30,
    tags: ['Thoughts', 'CCS', 'ISANDE1'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'tiffanyAnneSo',
    date: '04/30/2021',
    avatar: 'tiffany.jpg',
    postContent: 'Hi! Any tips for designing websites?', 
    likes: 30,
    tags: ['CCS', 'CCAPDEV'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'sirArren',
    date: '04/29/2021',
    avatar: 'sir.jpg',
    postContent: 'I will be teaching CCAPDEV for Term 2 A.Y.2020-2021', 
    likes: 30,
    tags: ['CCS', 'CCAPDEV'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'elianaMisa',
    date: '04/29/2021',
    avatar: 'eliana.jpg',
    postContent: 'Hi! Pre-enlistment concern :(( was just wondering until when we can pre-enlist!!', 
    likes: 30,
    tags: ['Student Services', 'USG'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'elianaMisa',
    date: '04/30/2021',
    avatar: 'eliana.jpg',
    postContent: 'LF: Workout buddy', 
    likes: 11,
    tags: ['Thoughts'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'elianaMisa',
    date: '05/01/2021',
    avatar: 'eliana.jpg',
    postContent: 'Happy Easter Sunday!!', 
    likes: 51,
    tags: ['Thoughts'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'elianaMisa',
    date: '05/01/2021',
    avatar: 'eliana.jpg',
    postContent: 'Can I ask for a copy of the flowchart for BS InSys', 
    likes: 2,
    tags: ['Student Services', 'CCS', 'Information Systems'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'zelongzhuang',
    date: '04/28/2021',
    avatar: 'tiger-avatar.jpg',
    postContent: 'For the ones taking up CCAPDEV this term! Sir Arren is a solid prof for CCAPDEV. Highly recommended! 100/10 🙂', 
    likes: 30,
    tags: ['Profs to Pick', 'CCS'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'zelongzhuang',
    date: '05/01/2021',
    avatar: 'tiger-avatar.jpg',
    postContent: 'Taking up BS in Information Systems is the best decision so far!', 
    likes: 11,
    tags: ['Thoughts', 'CCS'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);

var post = {
    username: 'zelongzhuang',
    date: '05/01/2021',
    avatar: 'tiger-avatar.jpg',
    postContent: 'For developers and programmers who often work on side projects, Github is an exceptional tool for that purpose.', 
    likes: 51,
    tags: ['Software', 'CCS'],
    commentNum: 0
};

/*
    calls the function insertOne()
    defined in the `database` object in `./models/db.js`
    stores the object `user` in the collection (table) `profiles`
*/
db.insertOne(Post, post, function() {
    console.log('Post Success');
    }
);