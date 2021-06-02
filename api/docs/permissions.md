# Permissions
The Role Based Access Controll (RBAC) is implemented. Users and organisations are given permission/privileges via static defined roles. E.g.  CBadmin will be allow to access all volunteers data from the same community business but volunteers are only allow to see their own data. The user, organisation and access role relationship is stored in the user_account_access_role table. 

## User Permissions/Roles
### Resources and their ownership
| Resource | Owner | Description |
|----------|-------|-------------|
| `organisations_details` | 🏢 Organisation | Core organisation details |
| `organisations_feedback` | 🏢 Organisation | Visitor feedback data |
| `organisations_volunteers` | 🏢 Organisation | Miscellaneous volunteer related metadata (e.g. projects) |
| `user_details` | 👩🏽 User | Core user details |
| `visit_activities` | 🏢 Organisation | Visit activities offered/listed by organisation |
| `visit_logs` | 👩🏽 User | Records of when a user visited/used services at an organisation |
| `volunteer_activities` | 🏢 Organisation | TBD |
| `volunteer_logs` | 👩🏽 User | Records of when a user volunteered time at an organisation |

#### Notes
* In the application, the "Organisation" is represented by `CB_ADMIN` users.
* The resource `users_details_anonymised` is not currently used but may be needed for funding bodies to access anonymised user data.

### Permission/role flags
* `*-children` - data of all child catagories
* `*-parent` - data of all parent catagories
* `*-own` - data directly owned by user
* `*-sibling` - data owned by a sibling (same level) user

### Access
* Read
* Write
* Delete?

### Validation
These roles are checked at the api entry point of the hapiJS authentification access check:
`
auth: {
    ...
    access: {
        scope: ['organisations_details-child:read'],
    },
},
`
through the scope. They have the format: resource-permissionLevel:access

## API Token Permissions
API tokens (currently) use a different set of permissions. This is simply to make the initial implementation simple. In future, as third-party access to the API is widened, it may be beneficial for API tokens to use the same permission set as regular users.

For now the only permission is:
```
api:visitor:read
```
Which is intended to allow read access to all resources related to the visitor app.

## References

- [Best practices for an authentication system](https://cybersecurity.ieee.org/blog/2016/06/02/design-best-practices-for-an-authentication-system/)
- [Authorization and authentication in microservices](https://initiate.andela.com/how-we-solved-authentication-and-authorization-in-our-microservice-architecture-994539d1b6e6)
- [Access control in nodejs](https://blog.nodeswat.com/implement-access-control-in-node-js-8567e7b484d1)
- [Designing an enterprise RBAC system](https://hackernoon.com/designing-an-enterprise-role-based-access-control-rbac-system-96e645c659b7)
- [How To Structure Permissions In A SaaS App](https://heapanalytics.com/blog/engineering/structure-permissions-saas-app)
