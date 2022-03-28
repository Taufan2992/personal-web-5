let projects = []

// mengambil data
function addProject() {
    let title = document.getElementById('project-name').value;
    let startdate = document.getElementById('start-date').value;
    let enddate = document.getElementById('end-date').value;
    let content = document.getElementById('content').value;
    let nodejs = document.getElementById('node-js')
    let nextjs = document.getElementById('next-js')
    let reactjs = document.getElementById('react-js')
    let typescript = document.getElementById('typescript')
    let image = document.getElementById('input-project-image').files[0];

    image = URL.createObjectURL(image)

    let startFull = new Date(startdate)
    let endFull = new Date (enddate)

    var printIcon = ""

    if (nodejs.checked == true) {
        printIcon += '<img id="node-js" src="assets/nodejs.png">'
    } 
    else {
        ''
    }
    if (nextjs.checked == true) {
        printIcon += '<img id="next-js" src="assets/nextjs.png">'
    } 
    else {
      ''  
    }
    if (reactjs.checked == true) {
        printIcon += '<img id="react-js" src="assets/react.png">'
    }
    else {
        ''  
      }
    if (typescript.checked == true) {
        printIcon += '<img id="typescript" src="assets/typescript.png"></img>'
    }
    else {
        ''  
      }                 
                        
                        
    let oneProject = {
        title:title,
        startdate:startFull,
        enddate:endFull,
        content:content,
        checkbox:printIcon,
        image:image,
    }

    projects.push(oneProject)

    renderProject()
 
}

// menampilkkan data
function renderProject () {
    let projectContainer = document.getElementById ('contents')

    projectContainer.innerHTML =''

    for (let i = 0; i < projects.length; i++) {
      projectContainer.innerHTML += `

        <div class="myproject-content-item">
        <div class="myproject-item-image">
            <img src=${projects[i].image} alt="">
        </div>
        <div class="myproject-item-title">
            <h3>${projects[i].title}</h3>
            <p>${getDistanceTime(projects[i].startdate, projects[i].enddate)}</p>
        </div>
        <div class="myproject-item-text">
            <p>${projects[i].content}</p>
        </div>
        <div class="myproject-item-icon">
            <img ${projects[i].checkbox}
        </div>
        <div class="myproject-item-button">
            <div class="button-left">
                <button>edit</button>
            </div>
            <div class="button-right">
                <button>delete</button>
            </div>
        </div>

    </div>

   `
    }
}

function getDistanceTime(startdate, enddate) {

  
    let distance = enddate - startdate// miliseconds
  
    let monthDistance = Math.floor(distance / (30 * 24 * 60 * 60 * 1000))
    
    if(monthDistance != 0){
        return monthDistance + ' months ago'
      }else {
        let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000))
    if(dayDistance != 0){
      return dayDistance + ' days ago'
    }else {
      let hourDistance = Math.floor(distance / (60 * 60 * 1000))
      
      if(hourDistance != 0) {
        return hourDistance + ' hours ago'
      }else {
        let minuteDistance = Math.floor(distance / (60 * 1000))
  
        if(minuteDistance != 0){
          return minuteDistance + ' minutes ago'
        } else {
          let secondsDistance = Math.floor(distance / 1000)
  
          return secondsDistance + ' second ago'
        }
      }
    }
  }
}

