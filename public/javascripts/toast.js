
const newToast=document.createElement('div');
newToast.id="toast";
newToast.classList.add('toast');
newToast.innerText="New Message";

document.body.insertAdjacentElement("beforeend", newToast);



function showToast(text,pos=false){

    const toast = document.getElementById("toast");
    toast.classList.add('show');
    toast.classList.remove('hide');

    if (pos) {
      toast.classList.add('pos');
    }
    toast.innerText = text;
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
    }, 2000);
}
