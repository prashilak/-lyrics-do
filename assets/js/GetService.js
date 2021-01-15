
const GetService = async (BaseUrl,suggetionString) => {

  if(suggetionString){
    let response = await fetch(BaseUrl + suggetionString, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
   if (response.ok) {
      let data = await response.json();

      return data;
   } else {
     alert("HTTP-Error: " + response.status);
   }

  }else{
    let response = await fetch(BaseUrl,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (response.ok) {
      let data = await response.json();
      return data;
    } else {
      alert("HTTP-Error: " + response.status);
    }
  }
};

export default GetService;