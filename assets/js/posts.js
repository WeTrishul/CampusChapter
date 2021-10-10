
{   
    // method to submit the form data for new post using AJAX
   
    let createPost = function(){
        let newPostForm = $('#new-post-form');

        newPostForm.submit(function(e){
            e.preventDefault();

            // document.getElementById('new-post-form').reset()
            

            $.ajax({
                type: 'post',
                url: 'http://wetrishul.in/postit',
                data: newPostForm.serialize(),
                success: function(data){
                //    console.log(data);
                let newPost = newPostDom(data.data.post);
                    $('#posts-list-container').prepend(newPost);
                    deletePost($('.delete-post-button', newPost));
                    console.log('doind')
                    new PostComments(data.data.post._id);

                    new Noty({
                        theme: 'relax',
                        text: "Post published!",
                        type: 'success',
                        layout: 'centerRight',
                        timeout: 1500
                        
                    }).show();

                    new ToggleLike($(' .toggle-like-button', newPost));
                    new ToggleReport($(' .report-button', newPost));

                }, error: function(error){
                    console.log(error.responseText);
                }
            });
            
        });
    }

    
    // method to create a post in DOM
    // ${ post.content }

    let newPostDom = function(post){
        console.log(post.id)
        return $(`<div id="post-${ post._id }">
        <div class=" bg-gray-200 shadow-lg rounded-lg  md:max-w-2xl "><!--horizantil margin is just for display-->
            <div class="flex items-start px-4 py-6">
               <img class="w-12 h-12 rounded-full object-cover mr-4 shadow" src="${ post.userid.dp }" alt="avatar">
               <div class="">
                  <div class="flex items-center justify-between">
                  <a href="/profilepage/${ post.userid.username }">  <h2 class="text-lg font-semibold text-gray-900 -mt-1">${ post.userid.username } </h2></a>
                     <a class="report-button" data-reports="${ post.report.length }" href="/Reporthandler/?id=${ post._id }&type=post"><small class="text-red-700">${ post.report.length } Report</small></a>

                  </div>
                  <p class="mt-3 text-gray-700 text-sm">
                  ${ post.postBody }
                  </p>
                  
                  <div class="mt-4 flex items-center">
                  
                      
                    <a class="toggle-like-button" data-likes="0" href="/Likehandler/?id=${ post._id }&type=post" class='toggle-like-button'>
                     
                        
                    ${ post.likes.length } likes
                    </a>
                    
                     <div class="flex mr-2 text-gray-700 text-sm mr-8">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 mr-1" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                        </svg>
                        <span>${ post.comments.length }</span>
                     </div>
                    
                     <a class="delete-post-button" href="/destroypost/${ post._id }">
                     <div class="flex mr-2 text-gray-700 text-sm mr-4">
                      
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clip-rule="evenodd" />
                        </svg>
                        <span>Delete</span>
                     </div>
                    </a>
  
                  </div>
               </div>
            </div>
         </div>
         <br>
         
         <div class="post-comments">

         <div class="post-comments-list">
          <div id="post-comments-${ post._id }">
          
        
      </div>
    </div>

        <br>
        <div class="">
        <form id="post-${ post._id }-comments-form" action="/commentit" method="POST">
          <input name="commentBody" placeholder="Comment here" class="bg-gray-300 w-auto rounded-xl px-2 p-2">
          <input name="postid" type="hidden" value="${ post._id }"> 
          <button class="bg-green-200 rounded-xl p-2" type="submit" id="send-message">Post</button>
        </form>
      </div>
    </div>
      <br>
      </div>`)
    }


    let deletePost = function(deleteLink){
      
      $(deleteLink).click(function(e){
          e.preventDefault();
          console.log('happened')
          $.ajax({
              type: 'get',
              url: $(deleteLink).prop('href'),
              success: function(data){
                  $(`#post-${data.data.post_id}`).remove();

                  new Noty({
                    theme: 'relax',
                    text: "Post deleted!",
                    type: 'success',
                    layout: 'centerRight',
                    timeout: 1500
                    
                }).show();

              },error: function(error){
                  console.log(error.responseText);
              }
          });

      });
  }



  let convertPostsToAjax = function(){
    $('#posts-list-container>div').each(function(){
        let self = $(this);
        let deleteButton = $(' .delete-post-button', self);
        deletePost(deleteButton);

        let postId = self.prop('id').split("-")[1]
        console.log(postId)

        new PostComments(postId);
    });
}
// 613b941a3213305c7ca04945


    createPost();
    convertPostsToAjax();
}
