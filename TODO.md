# TODO

- [ ] Update Jenkinsfile Terraform stages to resolve scenario directory from the repo checkout ($WORKSPACE/terraform/scenario1-free-tier) instead of searching under the host-mounted Jenkins home volume.
- [ ] De-duplicate workspace/scenario resolution logic across Terraform Init/Validate/Plan/Apply.
- [ ] Ensure docker run mounts the correct host workspace path for Terraform container (prefer mounting $(pwd) or $WORKSPACE).
- [ ] Run a quick lint/sanity check by grepping for the updated scenario path in Jenkinsfile.

