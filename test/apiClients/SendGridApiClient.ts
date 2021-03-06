import { MailData } from '@sendgrid/helpers/classes/mail';
import { Response } from 'request';
import { ResponseError } from '@sendgrid/helpers/classes';
import SendGridApiClient from '../../src/apiClients/SendGridApiClient';
import sgMail from '@sendgrid/mail';
import sinon from 'sinon';
import test from 'ava';

const fromEmail = 'anthony.wiencko@gmail.com';
const toEmail = 'wiencko@usc.edu';
const body = 'this is the body';
const subject = 'this is the subject';

let sendgridStub: sinon.SinonStub<
  [MailData[], boolean?, ((err: Error | ResponseError, result: [Response, {}]) => void)?],
  Promise<[Response, {}]>
>;
test.beforeEach(() => {
  sendgridStub = sinon.stub(sgMail, 'send');
});

test.afterEach.always(() => {
  sinon.restore();
});

test.serial('throws an exception when an empty api key is passed into its constructor', t => {
  t.throws(() => {
    new SendGridApiClient('');
  });
});

test.serial('resolves to true when sgMail.send is successful', async t => {
  const sendgridApiClient = new SendGridApiClient('non-empty key');
  const sendgridResult: [Response, {}] = [{} as Response, {}];
  sendgridStub.resolves(sendgridResult);

  const result = await sendgridApiClient.sendEmail(fromEmail, toEmail, body, subject);
  t.is(result, sendgridResult[0]);
  t.true(
    sendgridStub.calledWith(
      sinon.match.array.deepEquals([
        {
          to: toEmail,
          from: fromEmail,
          subject: subject,
          text: body,
          mailSettings: {
            sandboxMode: {
              enable: false,
            },
          },
        },
      ]),
    ),
  );
});

test.serial('rejects when sgMail.send rejects', async t => {
  sendgridStub.rejects();
  const sendgridApiClient = new SendGridApiClient('non-empty key');
  await t.throwsAsync(sendgridApiClient.sendEmail(toEmail, fromEmail, subject, body));
});
