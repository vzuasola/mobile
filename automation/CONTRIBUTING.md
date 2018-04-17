## How to contribute to this project.

There's a tight integration between [Jira](https://jira.ph.esl-asia.com/projects/AUT/issues)
and GitLab. To fully take advantage of this integration, you should follow this
procedure:

* Create a new AUT ticket, with the human description of what needs to be done if
not yet created for you in the sprint planning

The ticket is fundamental for the reviewer, it's the only way a reviewer can
tell you what you are trying to do matches the Ansible changes. No ticket or
incomplete ticket means NO MERGE

If you have SDP tickets or some other Jira tickets, mention and link them into
your AUT change.

* Create your Ansible change. Don't forget to mention the ticket number in your
commit message, so GitLab will keep your ticket updated.
when you're happy about your change and you have *fully tested it*, create a
merge request.

## Merge request
When creating the merge request, follow this rule:

**AUT-xx**: short description of the change, keep it it simple, title should
answer the following question: What will happen once this change is merged?
this change will: ...
```
   update deployment procedure
```

```
   change artifactory url
```
so use present verbs (avoid 'updated', 'changed', ...)

* **description**: mention why you need to make this change

* **discussion**: link any test result you have in the discussion section, this is
to prove your change works to the reviewer. Showing that your change works as
expected is a task for the person who creates the change.

### Title format
About the title: use this format: `AUT-<ticket number>: <product> - <short description>`

* **ticket**: you have an AUT ticket for this change, right? Because if you don't
have it, we are sorry, your change will not be merged to the master branch.
* **product**: name of the product affected from this change, can be `openesb`,
`kana`, `zipang`, `cms`. Always use lower case names (`KANA`, `Kana` are not
valid names)

#### Examples:
valid merge requests titles:

* AUT-1234: openesb - update deployment procedure
* AUT-0: casino - fix typo in task description
* AUT-0: cms - update email recipient list


Following titles are not valid:
* openesb: update deployment procedure (reference to ticket missing)

* AUT-1234: openesb - update deployment procedure because we are replacing A10
with brand-new-load-balancers-model1234 load balancers (too long: keep the
title short, details go into the description text field)

* AUT-1234 (not enough information)
