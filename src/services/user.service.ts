import {User} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {EmailNotification} from '../models';
import {NotificationService} from './notification.service';



export class UserService {

    constructor(
        @inject("NotificationService") protected _notificationService: NotificationService) {

    }


    public async sendEmailNewUser(user: User) {


        let notification = new EmailNotification({
            textBody: this.getBodyEmailUserRegistered(user.name, user.email),
            htmlBody: this.getBodyEmailUserRegistered(user.name, user.email),
            to: user.email,
            subject: 'Meeting-o-Matic | User Registration'
        });

        await this._notificationService.sendMailNotification(notification);
    }


    private getBodyEmailUserRegistered(userName: string, userEmail: string) {

        return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
						<html xmlns="http://www.w3.org/1999/xhtml">
						<head>
							<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
							<title>Meeting-o-Matic</title>
							<style type="text/css">
							body {margin: 0; padding: 0; min-width: 100%!important;}
							img {height: auto;}
							.content {width: 100%; max-width: 1000px;}
							.header {padding: 40px 30px 20px 30px;}
							.innerpadding {padding: 30px 30px 30px 30px;}
							.borderbottom {border-bottom: 1px solid #f2eeed;}
							.subhead {font-size: 15px; color: #ffffff; font-family: sans-serif; letter-spacing: 10px;}
							.h1, .h2, .bodycopy {color: #153643; font-family: sans-serif;}
							.h1 {font-size: 33px; line-height: 38px; font-weight: bold;}
							.h2 {padding: 0 0 15px 0; font-size: 24px; line-height: 28px; font-weight: bold;}
							.bodycopy {font-size: 16px; line-height: 22px;}
							.button {text-align: center; font-size: 18px; font-family: sans-serif; font-weight: bold; padding: 0 30px 0 30px;}
							.button a {color: #ffffff; text-decoration: none;}
							.footer {padding: 20px 30px 15px 30px;}
							.footercopy {font-family: sans-serif; font-size: 14px; color: #ffffff;}
							.footercopy a {color: #ffffff; text-decoration: underline;}

							@media only screen and (max-width: 550px), screen and (max-device-width: 550px) {
							body[yahoo] .hide {display: none!important;}
							body[yahoo] .buttonwrapper {background-color: transparent!important;}
							body[yahoo] .button {padding: 0px!important;}
							body[yahoo] .button a {background-color: #e05443; padding: 15px 15px 13px!important;}
							body[yahoo] .unsubscribe {display: block; margin-top: 20px; padding: 10px 50px; background: #2f3942; border-radius: 5px; text-decoration: none!important; font-weight: bold;}
							}

							/*@media only screen and (min-device-width: 601px) {
								.content {width: 600px !important;}
								.col425 {width: 425px!important;}
								.col380 {width: 380px!important;}
								}*/

							</style>
						</head>

						<body yahoo bgcolor="#f6f8f1">
						<table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td>
								<!--[if (gte mso 9)|(IE)]>
									<table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
										<tr>
											<td>
								<![endif]-->
								<table bgcolor="#ffffff" class="content" align="center" cellpadding="0" cellspacing="0" border="0">
									<tr>
										<td bgcolor="#007bff" class="header">
											<table width="70" align="left" border="0" cellpadding="0" cellspacing="0">
												<tr>
													<td height="70" style="padding: 0 20px 20px 0;">
														<img lass="fix" src="https://img.icons8.com/cotton/70/000000/open-envelope--v1.png"/>
													</td>
												</tr>
											</table>
											<!--[if (gte mso 9)|(IE)]>
												<table width="425" align="left" cellpadding="0" cellspacing="0" border="0">
													<tr>
														<td>
											<![endif]-->
											<table class="col425" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 425px;">
												<tr>
													<td height="70">
														<table width="100%" border="0" cellspacing="0" cellpadding="0">
															<tr>
																<td class="subhead" style="padding: 0 0 0 3px;">
																Reuniones a tu alcance
																</td>
															</tr>
															<tr>
																<td class="h1" style="padding: 5px 0 0 0;">
																	Meeting-o-Matic
																</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
											<!--[if (gte mso 9)|(IE)]>
														</td>
													</tr>
											</table>
											<![endif]-->
										</td>
									</tr>
									<tr>
										<td class="innerpadding borderbottom">
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
												<tr>
													<td class="h2">
														Hola ${userName}, gracias por utilizar Meeting-o-Matic!
													</td>
												</tr>
												<tr>
													<td class="bodycopy">
                                                        Su cuenta ha sido creada correctamente</b><br>
                                                        Usuario: ${userEmail}
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="innerpadding borderbottom">
											<table width="115" align="left" border="0" cellpadding="0" cellspacing="0">
												<tr>
													<td height="115" style="padding: 0 20px 20px 0;">
														<img class="fix" width="115" height="115" border="0" alt="" src="https://img.icons8.com/doodle/128/000000/apple-calendar.png"/>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									<tr>
										<td class="footer" bgcolor="#44525f">
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
												<tr>
													<td align="center" class="footercopy">
														&reg; 2020 | Meeting-o-Matic - Tópicos II - UNLP<br/>
												</td>
												</tr>
												</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
								</table>
								<!--[if (gte mso 9)|(IE)]>
											</td>
										</tr>
								</table>
								<![endif]-->
								</td>
							</tr>
						</table>
						</body>
						</html>`;

    }



}

