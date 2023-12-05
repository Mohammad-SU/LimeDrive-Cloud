<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LimeDrive.</title>
        <style>
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
            }
            
            body {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 2rem;
                font-family: "Consolas", monospace;
                text-align: center;
                background-color: black;
                color: lime;
                box-sizing: border-box;
            }

            .main-content {
                display: grid;
            }
                .heading-cont {
                    display: flex;
                    align-items: center;
                    gap: 2rem
                }
                    pre {
                        font-size: 0.6rem;
                    }
                    .rotating-line::before {
                        content: '/';
                        font-size: 4rem;
                        animation: rotateLine 0.5s infinite linear;
                    }
                    @keyframes rotateLine {
                        0% {
                            content: '/';
                        }
                        25% {
                            content: '—';
                        }
                        50% {
                            content: '\\';
                        }
                        75% {
                            content: '|';
                        }
                        100% {
                            content: '/';
                        }
                    }

                .thank-you-cont {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                    margin-bottom: 3.5rem;
                }
                    .rotating-line.thank-you::before {
                        font-size: 1rem;
                    }
                    .message {
                        font-size: max(12px, 1.1rem);
                    }
                    .message-br {
                        display: none;
                    }


                @media screen and (max-width: 768px) {
                    html {
                        font-size: 2.2vw;
                    }

                    .message-br {
                        display: block;
                    }
                }
        </style>
    </head>
    <body>
        <div class="main-content">
            <div class="heading-cont">
                <div class="rotating-line for-ascii"></div>    
                <pre class="welcome-ascii">
$$\      $$\           $$\                                                     $$\               
$$ | $\  $$ |          $$ |                                                    $$ |              
$$ |$$$\ $$ | $$$$$$\  $$ | $$$$$$$\  $$$$$$\  $$$$$$\$$$$\   $$$$$$\        $$$$$$\    $$$$$$\  
$$ $$ $$\$$ |$$  __$$\ $$ |$$  _____|$$  __$$\ $$  _$$  _$$\ $$  __$$\       \_$$  _|  $$  __$$\ 
$$$$  _$$$$ |$$$$$$$$ |$$ |$$ /      $$ /  $$ |$$ / $$ / $$ |$$$$$$$$ |        $$ |    $$ /  $$ |
$$$  / \$$$ |$$   ____|$$ |$$ |      $$ |  $$ |$$ | $$ | $$ |$$   ____|        $$ |$$\ $$ |  $$ |
$$  /   \$$ |\$$$$$$$\ $$ |\$$$$$$$\ \$$$$$$  |$$ | $$ | $$ |\$$$$$$$\         \$$$$  |\$$$$$$  |
\__/     \__| \_______|\__| \_______| \______/ \__| \__| \__| \_______|         \____/  \______/ 
                                                                                                    
                                                                                  
                                                                                        
    $$\       $$\                         $$$$$$$\            $$\                      $$\     
    $$ |      \__|                        $$  __$$\           \__|                     $$ |    
    $$ |      $$\ $$$$$$\$$$$\   $$$$$$\  $$ |  $$ | $$$$$$\  $$\ $$\    $$\  $$$$$$\  $$ |    
    $$ |      $$ |$$  _$$  _$$\ $$  __$$\ $$ |  $$ |$$  __$$\ $$ |\$$\  $$  |$$  __$$\ $$ |    
    $$ |      $$ |$$ / $$ / $$ |$$$$$$$$ |$$ |  $$ |$$ |  \__|$$ | \$$\$$  / $$$$$$$$ |\__|    
    $$ |      $$ |$$ | $$ | $$ |$$   ____|$$ |  $$ |$$ |      $$ |  \$$$  /  $$   ____|        
    $$$$$$$$\ $$ |$$ | $$ | $$ |\$$$$$$$\ $$$$$$$  |$$ |      $$ |   \$  /   \$$$$$$$\ $$\     
\________|\__|\__| \__| \__| \_______|\_______/ \__|      \__|    \_/     \_______|\__|</pre>
                <div class="rotating-line for-ascii"></div>    
            </div>

            <div class="thank-you-cont">
                <p class="message">Thank you for registering with LimeDrive.<br class="message-br"/> Glad to have you on board!</p>
            </div>
        </div>
    </body>
</html>