packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}


variable "ami_users" {
  type    = list(string)
  default = ["687843762779", "842771209345"]
}

variable "ami_instance_type" {
  type    = string
  default = "t2.micro"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "ami_source" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9" #debian 12
}

variable "ami_subnet_id" {
  type    = string
  default = "subnet-065aa6c21f5975eaa"
}

variable "ami_vpc_id" {
  type    = string
  default = "vpc-0ee41883ea70e7962"
}

variable "ami_name" {
  type    = string
  default = "webappAMI"
}

variable "ami_ssh_username" {
  type    = string
  default = "admin"
}

variable "ami_environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}


locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

source "amazon-ebs" "webapp-ami" {
  profile       = "dev"
  ami_name      = "${var.ami_name}-${local.timestamp}"
  ami_users     = var.ami_users
  instance_type = var.ami_instance_type
  region        = var.region
  source_ami    = var.ami_source
  ssh_username  = var.ami_ssh_username
  subnet_id     = var.ami_subnet_id
  tags = {
    Name        = "${var.ami_name}-${local.timestamp}"
    Environment = var.ami_environment
  }
  vpc_id = var.ami_vpc_id

  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    delete_on_termination = true
  }
}

build {
  sources = [
    "source.amazon-ebs.webapp-ami"
  ]

  provisioner "file" {
    source      = "../webapp"
    destination = "/home/admin/webapp"
  }

  provisioner "shell" {
    script = "packer/install-pckg.sh"
  }
}
