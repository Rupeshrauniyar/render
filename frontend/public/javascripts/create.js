const create = document.querySelector("#create")
const form = document.querySelector("#form")
const body = document.querySelector("body")
var flag = 0
if(flag === 0){
    create.addEventListener("click", () => {
        form.classList = "visible fixed flex flex-col text-center bg-gray-200 w-[30vw] h-[30vh] rounded-lg mt-16"
        body.classList = "bg-[#0000003C]"
        flag = 1
    })
    }

var cancel = document.querySelector("#cancel")
cancel.addEventListener("click", () => {
    form.classList = "hidden"
    body.classList = ""
    flag = 0
})
