const firebaseConfig = {
  apiKey: "AIzaSyBy5EB1Jg_0EY_mmtde65Or0nhdqulNW-Y",
  authDomain: "pikadu-25539.firebaseapp.com",
  databaseURL: "https://pikadu-25539.firebaseio.com",
  projectId: "pikadu-25539",
  storageBucket: "pikadu-25539.appspot.com",
  messagingSenderId: "464853610033",
  appId: "1:464853610033:web:57e954c99c13ce7c1b2f10"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const menuToggle = document.querySelector('#menu-toggle'),
      menu = document.querySelector('.sidebar'),
      loginElem = document.querySelector('.login'),
      loginSignin = document.querySelector('.login-signin'),
      loginForm = document.querySelector('.login-form'),
      emailInput = document.querySelector('.login-email'),
      passwordInput = document.querySelector('.login-password'),
      loginSigUp = document.querySelector('.login-sigup'),
      exitElem = document.querySelector('.exit'),
      editElem = document.querySelector('.edit'),
      editContainer = document.querySelector('.edit-container'),
      editUserName = document.querySelector('.edit-username'),
      editPhotoURL = document.querySelector('.edit-photo'),
      userAvatarElem = document.querySelector('.user-avatar'),
      editBtn = document.querySelector('.edit-btn'),
      postsWrapper = document.querySelector('.posts'),
      buttonNewPost = document.querySelector('.button-new-post'),
      addPostElem = document.querySelector('.add-post'),
      modalForm = document.querySelector('.modal-form'),
      addPostContent = document.querySelector('.add-post-content');

const userElem = document.querySelector('.user');
const userNameElem = document.querySelector('.user-name');

const DEFAULT_PHOTO = userAvatarElem.src;

const regExpValidEmail = /^\w+@\w+\.\w{2,}$/;

const setUsers = {
  user: null,
  initUser(handler) {
    firebase.auth().onAuthStateChanged(user => {
      if(user) {
        this.user = user;
      } else {
        this.user = null;
      }
      if(handler) handler();
    });
  }, 

  logIn(email, password) {
    if(!regExpValidEmail.test(email)) return alert('Email не валиден');
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => {
        const errCode = err.code;
        const errMessage = err.message;
        if(errCode === 'auth/wrong-password') {
          console.log(errMessage);
          alert('Неверный пароль');
        } else if(errCode === 'auth/user-not-found') {
          console.log(errMessage);
          alert('Пользователь не найден');
        } else {
          alert(errMessage);
        }
        console.log(err);
      })
  },

  logOut() {
    firebase.auth().signOut();
  },

  signUp(email, password, handler) {
    if(!regExpValidEmail.test(email)) return alert('Email не валиден');
    if(!email.trim() || !password.trim()) {
      alert('Введите данные');
      return
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(data => {
        this.editUser(email.substring(0, email.indexOf('@')), null, handler);
      })
      .catch(err => {
        const errCode = err.code;
        const errMessage = err.message;
        if(errCode === 'auth/weak-password') {
          console.log(errMessage);
          alert('Слабый пароль');
        } else if(errCode === 'auth/email-already-in-use') {
          console.log(errMessage);
          alert('Этот Email уже используется');
        } else {
          alert(errMessage);
        }
        console.log(err);
      });
  },

  editUser(displayName, photoURL, handler) {
    const user = firebase.auth().currentUser;
    if(displayName) {
      if(photoURL) {
        user.updateProfile({
          displayName,
          photoURL 
        }).then(handler)
      } else {
        user.updateProfile({
          displayName
        }).then(handler)
      }
    }
  },

  sendForget(email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Письмо отправлено')
      })
      .cath(err => {
        console.log(err);
      })
  }
}

const loginForget = document.querySelector('.login-forget');
loginForget.addEventListener('click', event => {
  event.preventDefault();
  setUsers.sendForget(emailInput.value);
  emailInput.value = '';
})

const setPosts = {
  allPosts: [],
  addPost(title, text, tags, handler) {

    const user = firebase.auth().currentUser;

    this.allPosts.unshift({
      id: `postID${(+new Date()).toString(16)}`,
      title,
      text,
      tags: tags.split(' '),
      author: {
        displayName: setUsers.user.displayName,
        photo: setUsers.user.photoURL,
      },
      date: new Date().toLocaleString(),
      like: 0, 
      comments: 0
    });

    firebase.database().ref('post').set(this.allPosts)
      .then(() => this.getPosts(handler))

    if(handler) {
      handler();
    }
  },
  getPosts(handler) {
    firebase.database().ref('post').on('value', snapshot => {
      this.allPosts = snapshot.val() || [];
      handler();
    })
  },
  // editPost(displayName, photoURL, handler) {
  //   // console.log(this.allPosts);
  //   console.log(firebase.database().ref('post'))
  //   if(setUsers.editUser) {
  //     this.allPosts[0].author.displayName = displayName;
  //   }
  // }
};

const toggleAuthDom = () => {
  const user = setUsers.user;
  if(user) {
    loginElem.style.display = 'none';
    userElem.style.display = '';
    userNameElem.textContent = user.displayName;
    userAvatarElem.src = user.photoURL || DEFAULT_PHOTO;
    buttonNewPost.classList.add('visible');
  } else {
    loginElem.style.display = '';
    userElem.style.display = 'none';
    buttonNewPost.classList.remove('visible');
    modalForm.classList.remove('visible');
    postsWrapper.classList.add('show');
  }
};

const showAddPost = () => {
  modalForm.classList.add('visible');
  postsWrapper.classList.remove('show');
}

const showAllPosts = () => {

  let postsHTML = '';

  setPosts.allPosts.forEach(item => postsHTML += `
      <section class="post">
        <div class="post-body">
          <h2 class="post-title">${item.title}</h2>
          <p class="text">${item.text}</p>
          <div class="tags">
            ${item.tags.map(tag => `<a href="#" class="tag">#${tag}</a>`).join('')}
          </div>
        </div>
        <div class="post-footer">
          <div class="post-buttons">
            <button class="post-button like">
              <svg width="18" height="20" class="icon icon-like">
                <use xlink:href="images/icons.svg#like"></use>
              </svg>
              <span class="likes-counter">${item.like}</span>
            </button>
            <button class="post-button comments">
              <svg width="21" height="21" class="icon icon-comment">
                <use xlink:href="images/icons.svg#comment"></use>
              </svg>
              <span class="comments-counter">${item.comments}</span>
            </button>
            <button class="post-button save">
              <svg width="19" height="19" class="icon icon-comment">
                <use xlink:href="images/icons.svg#save"></use>
              </svg>
            </button>
            <button class="post-button share">
              <svg width="17" height="19" class="icon icon-share">
                <use xlink:href="images/icons.svg#share"></use>
              </svg>
            </button>
          </div>
          <div class="post-author">
            <div class="author-about">
              <a href="#" class="author-user">${item.author.displayName}</a>
              <span class="post-time">${item.date}</span>
            </div>
            <a href="#" class="author-link">
              <img src=${item.author.photo || "images/hi.jpg"} alt="Avatart" class="author-avatar">
            </a>
          </div>
        </div>
      </section>   
  `);

  postsWrapper.innerHTML = postsHTML;

  modalForm.classList.remove('visible');
  postsWrapper.classList.add('show');

}


const init = () => {
  loginSignin.addEventListener('click', e => {
    e.preventDefault();
    setUsers.logIn(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });

  loginSigUp.addEventListener('click', e => {
    e.preventDefault();
    setUsers.signUp(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });

  exitElem.addEventListener('click', e => {
    e.preventDefault();
    setUsers.logOut();
  });

  editElem.addEventListener('click', e => {
    e.preventDefault();
    editContainer.classList.toggle('show');
    editUserName.value = setUsers.user.displayName;
  });

  editBtn.addEventListener('click', e => {

    e.preventDefault();

    setUsers.editUser(editUserName.value, editPhotoURL.value, toggleAuthDom);
    // setPosts.editPost(editUserName.value, editPhotoURL.value);
    editContainer.classList.remove('show');
  });

  buttonNewPost.addEventListener('click', e => {
    e.preventDefault();
    showAddPost();
  });

  document.addEventListener('click', e => {
    e.preventDefault();
    if(e.target.matches('.button-new-post')) {
      modalForm.classList.add('visible');
    } else if(!e.target.closest('.add-post-content')) {
      modalForm.classList.remove('visible');
    } else if(e.target.matches('.add-button')) {
      const { title, text, tags } = addPostElem.elements;
      if(title.value.length < 4) {
        alert('Слишком короткий заголовок');
        return;
      } else if(text.value < 30) {
        alert('Слишком короткий пост');
        return;
      } 
    
    setPosts.addPost(title.value, text.value, tags.value, showAllPosts);
    modalForm.classList.remove('visible');
    addPostElem.reset();
    }
  });

  menuToggle.addEventListener('click', e => {
    e.preventDefault();
    menu.classList.toggle('visible');
  })

  setUsers.initUser(toggleAuthDom);
  setPosts.getPosts(showAllPosts);
}

document.addEventListener('DOMContentLoaded', init);



