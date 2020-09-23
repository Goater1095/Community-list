const userCard = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('.pagination')
const genderFilter = document.querySelector('.gender-filter')
const User_PER_PAGE = 15
const userDataArray = []
let filterUsers = []

axios.get('https://lighthouse-user-api.herokuapp.com/api/v1/users').then(response => {
  userDataArray.push(...response.data.results)
  renderUsers(getUserByPage(1))
  renderPaginator(userDataArray)
}).catch(error => { console.log(error) })

genderFilter.addEventListener('click', function filter(event) {
  if (event.target.matches('.all-filter')) {
    filterUsers = userDataArray
  } else if (event.target.matches('.male-filter')) {
    filterUsers = userDataArray.filter(user => user.gender === 'male')
  } else if (event.target.matches('.female-filter')) {
    filterUsers = userDataArray.filter(user => user.gender === 'female')
  }
  renderUsers(getUserByPage(1))
  renderPaginator(filterUsers)
})

searchForm.addEventListener('submit', function onClickSearch(event) {
  event.preventDefault()
  const inputValue = searchInput.value.trim().toLowerCase()
  searchUser(inputValue)

})

userCard.addEventListener('click', function clickVisit(event) {
  if (event.target.matches('.card-img-top')) {
    showUserDetail(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addDeleteFavoriteUser(event.target.dataset.id)
    changeHeart(event.target)
  }
})

paginator.addEventListener('click', function OnClickPaginator(event) {
  if (event.target.tagName === 'A') {
    renderUsers(getUserByPage(Number(event.target.innerText)))
  }
})

// 搜尋好友

function searchUser(inputValue) {
  if (!inputValue.length) {
    return alert('請輸入正確名稱')
  }

  filterUsers = userDataArray.filter(user => (user.name + user.surname).toLowerCase().includes(inputValue))

  if (!filterUsers.length) {
    return alert(`沒有找到關鍵字: ${inputValue} 的相關的使用者`)
  }
  renderUsers(getUserByPage(1))
  renderPaginator(filterUsers)
}

// 收藏刪除好友
function addDeleteFavoriteUser(id) {
  const list = JSON.parse(localStorage.getItem('favoriteList')) || []
  const user = userDataArray.find(user => user.id === Number(id))
  const startIndex = list.findIndex(user => user.id === Number(id))

  if (list.some(user => user.id === Number(id))) {
    list.splice(startIndex, 1)
    localStorage.setItem('favoriteList', JSON.stringify(list))
    breakHeartMove(id)
    return
    // return alert('此人已從最愛中移除')
  }
  list.push(user)
  localStorage.setItem('favoriteList', JSON.stringify(list))
}

// 分頁
function getUserByPage(page) {
  const data = filterUsers.length ? filterUsers : userDataArray
  return data.slice((page - 1) * User_PER_PAGE, page * User_PER_PAGE)
}

function renderPaginator(data) {
  const pageNumbers = Math.ceil(data.length / User_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i < pageNumbers + 1; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}



//渲覽畫面
function renderUsers(array) {
  const list = JSON.parse(localStorage.getItem('favoriteList')) || []
  let rawHTML = ''
  for (let user of array) {
    rawHTML += ` 
      <div class="card ${user.gender} rounded-lg my-3 mx-2 border-0" style="width: 13rem;" >
        <img src="${user.avatar}" class="card-img-top ${user.gender} img-fluid" data-toggle="modal" data-target="#user-detail" data-id='${user.id}' data-index='_${user.id}' alt="User-Image">
        <h6 class="card-title mt-2 mb-1 text-center">${user.name} ${user.surname}</h6>
          `
    if (list.some(one => one.id === user.id)) {
      rawHTML += `
        <i class="fas far fa-heart btn-add-favorite" data-id='${user.id}'></i>
      </div>`
    } else {
      rawHTML += ` 
        <i class="far fa-heart btn-add-favorite" data-id='${user.id}'></i>
      </div>`
    }
  }
  userCard.innerHTML = rawHTML
}
//modal
function showUserDetail(id) {
  const userContent = document.querySelector('.modal-content')
  const userBody = document.querySelector('.modal-body')
  const userName = document.querySelector('.modal-title')
  const userImage = document.querySelector('.modal-image')
  const userDescription = document.querySelector('.modal-description')

  axios.get('https://lighthouse-user-api.herokuapp.com/api/v1/users/' + id)
    .then(response => {
      userName.innerHTML = response.data.name + ' ' + response.data.surname
      userImage.src = response.data.avatar
      userDescription.innerHTML = `<p><b>Gender:</b> &nbsp ${response.data.gender}</p>
                                  <p><b>Region:</b> &nbsp ${response.data.region}</p>
                                  <p><b>Age:</b> &nbsp ${response.data.age}</p>
                                  <p><b>Birthday:</b> &nbsp ${response.data.birthday}</p>
                                  <p><b>Email:</b> &nbsp ${response.data.email}</p>`

      userContent.classList.remove('male')
      userContent.classList.remove('female')
      userContent.classList.add(`${response.data.gender}`)
      userBody.classList.remove('male')
      userBody.classList.remove('female')
      userBody.classList.add(`${response.data.gender}`)
      userName.classList.remove('male')
      userName.classList.remove('female')
      userName.classList.add(`${response.data.gender}`)

    }).catch(error => console.log('error'))
}

//變更愛心(實心空心)
function changeHeart(heartBtn) {
  heartBtn.classList.toggle('fas')
}

//碎掉的愛心
function breakHeartMove(id) {
  const breakHeart = document.createElement('i')
  breakHeart.classList.add('fas', 'fa-heart-broken', 'break-heart')
  const box = document.querySelector(`img[data-index=_${id}]`)
  // const box = document.querySelector('.card')
  box.after(breakHeart)
  setTimeout(() => breakHeart.remove(), 2000)
}
